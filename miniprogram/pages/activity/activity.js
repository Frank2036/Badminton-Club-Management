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
    subject:'天津蓝天羽毛球俱乐部活动',
    address:'正能量羽毛球馆',
    court: 'VIP 1-5号',
    limit:30,
    price: '单次成人男45，成人女35， 学生25',
    activityDate: '',
    activityTime: '晚19点至22点',
    comments: '',
    registerUserInfo: [],
    enrolled: false,
    enroll_amount:20,
    allow_enroll: true,
    allow_cancel: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    
    //load the recent activity information
    const today_str = JSON.stringify(new Date()).substr(1,10);
    var latestActivity = {};
    db.collection("club_activity").where({
      activityDate: db.command.gte(utils.formatDay(new Date))}).orderBy("activityDate", "asc").get().then(res => {
        if (res.data.length > 0){
        latestActivity = res.data[0];      
        this.setData({
          activity_id: latestActivity._id,
          subject: latestActivity.subject,
          address: latestActivity.address,
          court: latestActivity.court,
          limit: latestActivity.limit,
          price: latestActivity.price,
          activityDate: JSON.stringify(latestActivity.activityDate).substr(1,10),
          activityTime: latestActivity.activityTime,
          comments: latestActivity.comments,
        })
        }
      })
    
    //load enroll information
    const MAX_LIMIT=20;
    const userInfoHistory =  [];

    db.collection("club_activity_register_history").where({
      activity_id: latestActivity.activity_id
      }).skip(0).limit(MAX_LIMIT).get().then(res=>{          
        for (var i=0; i < res.data.length; i++){
          userInfoHistory.push(res.data[i].userInfo);
        }
        this.setData({
          registerUserInfo : userInfoHistory,
          enroll_amount : userInfoHistory.length,
        })
      }),  

    db.collection("club_activity_register_history").where({
      activity_id: this.activity_id
      }).skip(MAX_LIMIT).limit(MAX_LIMIT).get().then(res=>{  
      for (var i=0; i < res.data.length; i++){
        userInfoHistory.push(res.data[i].userInfo);
      }
      this.setData({
        registerUserInfo : userInfoHistory,
        enroll_amount : userInfoHistory.length,
      })
    })

    
    //check if the current user has enrolled. If enrolled, set "enroll" button disabled
    //if the enroll_amount >= limit, then "enroll" button disabled
    var user_openid = '';
    wx.cloud.callFunction({
      name: "login",
      success: res =>{
          user_openid = res.result.openid;          
          db.collection("club_activity_register_history").where({
            "_openid": user_openid,
            }).count().then(res => {
              if (res.total > 0){
                that.setData({
                  allow_enroll: false,
                  allow_cancel: true,
                })} else{
                  that.setData({
                    allow_enroll: true,
                    allow_cancel: false,
                  })
                }
            })
      }
    })
  },
        
    
    

  //register after user press enroll button
  registerActivity: function(event){   
    const userInfo = event.detail.userInfo;
    if (userInfo){
      app.setUserInfo(userInfo);
    }
    const db=wx.cloud.database();
    db.collection("club_activity_register_history").add({
      data:{
        'activity_id': this.data.activity_id,
        'userInfo': userInfo,
      }
    })
    
    wx.showToast({
      title: "报名成功！"
    })

    var that = this;
    setTimeout(function(){
      that.onLoad();
    },500)
      
  },

  //un-register after user press "cancel" button
  unregisterActivity: function(event){       
    
    const db=wx.cloud.database();
    var enroll_id = "";
    var user_openid = '';
    wx.cloud.callFunction({
      name: "login",
      success: res =>{
          user_openid = res.result.openid;          
          db.collection("club_activity_register_history").where({
            "_openid": user_openid,
          }).get().then(res=>{
              enroll_id = res.data[0]._id;
              db.collection("club_activity_register_history").doc(enroll_id).remove().then(res=>{
                console.log(res);
              })
          })
      }
    })
     
    wx.showToast({
      title: "取消成功！"
    })

    var that = this;
    setTimeout(function(){
      that.onLoad();
    },1000)
    
 
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