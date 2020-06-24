var utils = require('../../utils/util.js');
var app = getApp();
Page({

  data: {
    subject:'天津蓝天羽毛球俱乐部活动',
    address:'正能量羽毛球馆',
    court: 'VIP 1-5号',
    limit:30,
    price: '单次成人男45，成人女35， 学生25',
    activityDate: utils.formatDay(new Date),
    activityTime: '晚19点至22点',
    comments: '俱乐部每周三周六晚19点至22点活动,欢迎使用小程序直接报名最近一次活动;如有朋友需要报名，可点击右上角的三个点转发',
    admin: 'ti10',
    isAdmin: false,
  },

  onLoad: function (options) {
    const admin = 'ti10';
    var nickName = "";
    
    if (app.is_login()){
      nickName = app.globalData.userInfo.nickName;
    }
    if (nickName == admin){
      this.setData({
        isAdmin: true,
      })
    }
    
  },

  onShow: function () {
  
  },


  onPullDownRefresh: function () {
  
  },

  onReachBottom: function () {
  
  },

  onShareAppMessage: function () {
  
  },

  //输入活动名称
  inputSubject(e){
    this.setData({
      subject: e.detail.value
    })
  },
  
  //输入地点
  inputAddress(e){
    this.setData({
      address: e.detail.value
    })
  },

  //输入场地号
  inputCourt(e){
    this.setData({
      court: e.detail.value
    })
  },  

  //修改人数上限
  inputLimit(e){
    this.setData({
      limit: e.detail.value
    })
  },  

  //修改价格
  inputPrice(e){
    this.setData({
      price: e.detail.value
    })
  },    

  //修改人数上限
  inputLimit(e){
    this.setData({
      limit: e.detail.value
    })
  },  

  //修改活动日期
  changeDate(e){
    this.setData({
      activityDate: e.detail.value
    })
  },

  //修改活动时间
  inputTime(e){
    this.setData({
      activityTime: e.detail.value
    })
  },

  //修改活动备注
  inputComments(e){
    this.setData({
      comments: e.detail.value
    })
  },

  submitTest(e){
    console.log("submit Test");
  },

  //点击提交
  submitInfo(e){
    const submitData = {
      'subject': this.data.subject,
      'address': this.data.address,
      'court': this.data.court,
      'limit': this.data.limit,
      'price': this.data.price,
      'activityDate': this.data.activityDate,
      'activityTime': this.data.activityTime,
      'comments': this.data.comments,
      'creator': "blueskyti10"
    }
    console.log("start submit info");
    //对输入数据进行校验
    const db=wx.cloud.database();
    db.collection("club_activity").add({
      data:{
        'subject': this.data.subject,
        'address': this.data.address,
        'court': this.data.court,
        'limit': this.data.limit,
        'price': this.data.price,
        'activityDate': this.data.activityDate,
        'activityTime': this.data.activityTime,
        'comments': this.data.comments,
        'creator': "blueskyti10"
      }
      }).then(res=>{
      console.log(res);
      
      wx.showToast({
        title: "创建成功！"
      })

      setTimeout(function(){
        wx.switchTab({
          url: '/pages/activity/activity',  
      })
      },1000)      
    });
  }
})