// pages/activity/activity.js
var utils = require('../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wx_openID: '',
    activity_id: '',
    subject: '天津蓝天羽毛球俱乐部活动',
    address: '正能量羽毛球馆',
    court: 'VIP 1-5号',
    limit: 30,
    price: '单次成人男45，成人女35， 学生25',
    activityDate: '',
    activityTime: '晚19点至22点',
    comments: '',
    registerUserInfo: [],
    enrolled: false,
    enroll_amount: 20,
    disable_enroll: true,
    disable_cancel: true,
    enroll_timeStamp: 0,
    cancel_timeStamp: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;

    //load the recent activity information
    const today_str = JSON.stringify(new Date()).substr(1, 10);
    var latestActivity = {};
    latestActivity._id = 'justForSpecialCase';
    db.collection("club_activity").where({
      activityDate: db.command.gte(utils.formatDay(new Date))
    }).orderBy("activityDate", "asc").get().then(res => {
      if (res.data.length > 0) {
        latestActivity = res.data[0];
        this.setData({
          activity_id: latestActivity._id,
          subject: latestActivity.subject,
          address: latestActivity.address,
          court: latestActivity.court,
          limit: latestActivity.limit,
          price: latestActivity.price,
          activityDate: JSON.stringify(latestActivity.activityDate).substr(1, 10),
          activityTime: latestActivity.activityTime,
          comments: latestActivity.comments,
        })
        return latestActivity._id;
      }
    }).then(function (selected_activity_id) {
      //check if the current user has enrolled. If enrolled, set "enroll" button disabled
      //if the enroll_amount >= limit, then "enroll" button disabled
      var user_openid = '';
      wx.cloud.callFunction({
        name: "login",
        success: res => {
          user_openid = res.result.openid;
          db.collection("club_activity_register_history").where({
            _openid: user_openid,
            activity_id: selected_activity_id,
          }).get().then(res => {
            if (res.data.length > 0) {
              that.setData({
                disable_enroll: true,
                disable_cancel: false,
              })
            } else {
              that.setData({
                disable_enroll: false,
                disable_cancel: true,
              })
            }
            if (that.data.enroll_amount >= that.data.limit) {
              that.setData({
                disable_enroll: true,
              })
            }

          })
        }
      })

      //load enroll information
      const MAX_LIMIT = 20;
      var userInfoHistory = [];
      db.collection("club_activity_register_history").where({
        activity_id: selected_activity_id
      }).skip(0).limit(MAX_LIMIT).get().then(res => {
        for (var i = 0; i < res.data.length; i++) {
          userInfoHistory.push(res.data[i].userInfo);
        }
        that.setData({
          registerUserInfo: userInfoHistory,
          enroll_amount: userInfoHistory.length,
        })
      }),

        db.collection("club_activity_register_history").where({
          activity_id: selected_activity_id
        }).skip(MAX_LIMIT).limit(MAX_LIMIT).get().then(res => {
          for (var i = 0; i < res.data.length; i++) {
            userInfoHistory.push(res.data[i].userInfo);
          }
          that.setData({
            registerUserInfo: userInfoHistory,
            enroll_amount: userInfoHistory.length,
          })
        })

    })
  },




  //register after user press enroll button
  registerActivity: function (event) {
    const userInfo = event.detail.userInfo;
    var maxID = 0;

    console.log(event.detail.userInfo);

    if (this.data.enroll_timeStamp == 0 || event.timeStamp - this.data.enroll_timeStamp > 2000) {
      this.data.enroll_timeStamp = event.timeStamp;
      if (userInfo) {
        app.setUserInfo(userInfo);
      } else {
        wx.showToast({
          title: "抱歉，未授权无法完成报名",
          icon: "none",
        })
        return;
      }

      this.setData({
        disableEnroll: true,
      })

      const db = wx.cloud.database();
      //保存报名信息
      db.collection("club_activity_register_history").add({
        data: {
          'activity_id': this.data.activity_id,
          'userInfo': userInfo,
        }
      })

      wx.showToast({
        title: "报名成功！"
      })

      var that = this;
      setTimeout(function () {
        that.onLoad();
      }, 200)

      //若为新人则创建个人信息
      db.collection("user_info").where({
        _openid: app.globalData.openidID,
      }).get().then(res => {
        console.log(res);
        if (res.data.length == 0) {
          
          //生成clubID
          db.collection("user_info").count().then(res=>{
            console.log(res);
            maxID = res.total + 1;
            console.log(maxID);
          }).then(res=>{
          db.collection("user_info").add({
            data: {
              'clubID': maxID,
              'avatarURL': app.globalData.userInfo.avatarUrl,
              'nickName': app.globalData.userInfo.nickName,
              'gender': app.globalData.userInfo.gender,
              'language': app.globalData.userInfo.language,
              'city': app.globalData.userInfo.city,
              'province': app.globalData.userInfo.province,
              'status': "new"
            }
          }) 
        })
        }
      })
    }
  },



  //un-register after user press "cancel" button
  unregisterActivity: function (event) {

    if (this.data.cancel_timeStamp == 0 || event.timeStamp - this.data.cancel_timeStamp > 2000) {
      this.data.cancel_timeStamp = event.timeStamp;
    const db = wx.cloud.database();
    var that = this;
    var enroll_id = "";
    var user_openid = '';

    this.setData({
      disableCancel: true,
    })

    wx.cloud.callFunction({
      name: "login",
      success: res => {
        user_openid = res.result.openid;
        db.collection("club_activity_register_history").where({
          _openid: user_openid,
          activity_id: this.data.activity_id,
        }).get().then(res => {
          enroll_id = res.data[0]._id;
          db.collection("club_activity_register_history").doc(enroll_id).remove().then(res => {
            wx.showToast({
              title: "取消成功！"
            })
            that.onLoad();
          })
        })
      }
    })
  }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})