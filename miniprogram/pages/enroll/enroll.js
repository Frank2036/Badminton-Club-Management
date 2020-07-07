// pages/activity/activity.js
var utils = require('../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    var that = this;
    that.choosePreferActivity(this.setHeaderData, this.allowEnrollCheck, this.loadEnrollInfo);
  },

  //select prefer activity information
  choosePreferActivity: function (callback1, callback2, callback3) {
    const db = wx.cloud.database();
    var prefer_activity_id = app.globalData.prefer_activity_id;
    var prefer_activity_info = {};
    var that = this;
    if (prefer_activity_id != "no-prefer") {
      db.collection("club_activity").where({
        _id: prefer_activity_id
      }).get().then(res => {
        prefer_activity_info = res.data[0];
        app.globalData.prefer_activity_id = prefer_activity_info._id;
        callback1(prefer_activity_info);
        callback2(prefer_activity_info);
        callback3(prefer_activity_info);
        
      })
    } else {
      db.collection("club_activity").where({
        activityDate: db.command.gte(utils.formatDay(new Date))
      }).orderBy("activityDate", "asc").get().then(res => {
        if (res.data.length > 0) {
          prefer_activity_info = res.data[0];
          app.globalData.prefer_activity_id = prefer_activity_info._id;
          callback1(prefer_activity_info);
          callback2(prefer_activity_info);
          callback3(prefer_activity_info);
        }
      })
    }
  },

  //callback1 of function choosePreferActivity
  setHeaderData: function(prefer_activity_info){
    this.setData({
      activity_id: prefer_activity_info._id,
      subject: prefer_activity_info.subject,
      address: prefer_activity_info.court,
      court: prefer_activity_info.court,
      limit: prefer_activity_info.limit,
      price: prefer_activity_info.price,
      activityDate: prefer_activity_info.activityDate,
      activityTime: prefer_activity_info.activityTime,
      comments: prefer_activity_info.comments,
    })
  },
  
  //callback2 of function choosePreferActivity
  allowEnrollCheck: function (prefer_activity_info) {
    const db = wx.cloud.database();
    var that = this;
    var user_openid = '';
    wx.cloud.callFunction({
      name: "login",
      success: res => {
        user_openid = res.result.openid;
        db.collection("club_activity_register_history").where({
          _openid: user_openid,
          activity_id: prefer_activity_info._id,
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
  },

  //callback3 of function choosePreferActivity
  loadEnrollInfo: function (prefer_activity_info) {
    var that = this;
    const db = wx.cloud.database();
    const MAX_LIMIT = 20;
    var userInfoHistory = [];
    db.collection("club_activity_register_history").where({
      activity_id: prefer_activity_info._id
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
        activity_id: prefer_activity_info._id
      }).skip(MAX_LIMIT).limit(MAX_LIMIT).get().then(res => {
        for (var i = 0; i < res.data.length; i++) {
          userInfoHistory.push(res.data[i].userInfo);
        }
        that.setData({
          registerUserInfo: userInfoHistory,
          enroll_amount: userInfoHistory.length,
        })
      })

  },

  //register after user press enroll button
  registerActivity: function (event) {
    const userInfo = event.detail.userInfo;
    console.log(event.detail.userInfo);
    if (this.data.enroll_timeStamp == 0 || event.timeStamp - this.data.enroll_timeStamp > 3000) {
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

      const db = wx.cloud.database();
      //保存报名信息
      db.collection("club_activity_register_history").add({
        data: {
          'activity_id': this.data.activity_id,
          'userInfo': userInfo,
        }
      }).then(res=>{
        console.log(res);      

        wx.showToast({
          title: "报名成功！"
        })

        this.onLoad();
      })

      //若为新人则创建个人信息
      db.collection("user_info").where({
        _openid: app.globalData.openidID,
      }).get().then(res => {
        console.log(res);
        if (res.data.length == 0) {
        db.collection("user_info").add({
              data: {
                'avatarURL': app.globalData.userInfo.avatarUrl,
                'nickName': app.globalData.userInfo.nickName,
                'gender': (app.globalData.userInfo.gender == 1)? "男":((app.globalData.userInfo.gender == 2)? "女":"待定"),
                'language': app.globalData.userInfo.language,
                'city': app.globalData.userInfo.city,
                'province': app.globalData.userInfo.province,
                'status': "new",
                'creation_date': utils.formatDay(new Date)
              }
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad();
  },

})