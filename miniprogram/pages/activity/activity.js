// pages/activity/activity.js
const app = getApp();
var utils = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const db = wx.cloud.database();

    //load the recent activity information
    const _ = db.command;
    const today_str = JSON.stringify(new Date()).substr(1,10);

    db.collection("club_activity").where({
      activityDate: db.command.gte(utils.formatDay(new Date))}).orderBy("activityDate", "asc").get().then(res => {
        const latestActivity = res.data[0];
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
      })
    
    //load enroll information
    const MAX_LIMIT=20;
    const userInfoHistory =  [];

    
    db.collection("club_activity_register_history").where({
      activity_id: this.activity_id
      }).skip(0).limit(MAX_LIMIT).get().then(res=>{          
        for (var i=0; i < res.data.length; i++){
          userInfoHistory.push(res.data[i].userInfo);
        }
        this.setData({
          registerUserInfo : userInfoHistory,
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
      })
    })

    //check if the current user has enrolled. If enrolled, set "enroll" button disabled
    const userInfo = app.globalData;
    const name = app.globalData.nickName;

    db.collection("club_activity_register_history").where({
      "userInfo.nickName": name,
      }).count().then(res => {
        console.log(res);
        if (res.total > 0){
          this.setData({
            enrolled: true,
          })} else{
            this.setData({
              enrolled: false,
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

      var that = this;
      setTimeout(function(){
        console.log("register activity");
        that.onLoad();
      },1000);
      
      
  },

  unregisterActivity: function(event){   
    
    const userInfo = app.globalData;
    const name = app.globalData.nickName;

    const db=wx.cloud.database();
    var enroll_id = "";
    db.collection("club_activity_register_history").where({
      "userInfo.nickName": name,
    }).get().then(res=>{
        enroll_id = res.data[0]._id;
        console.log(enroll_id);

        db.collection("club_activity_register_history").doc(enroll_id).remove().then(res=>{
          console.log(res);
      })
    })

    var that = this;
    setTimeout(function(){
      console.log("un-register activity");
      that.onLoad();
    },1000);
    
 
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