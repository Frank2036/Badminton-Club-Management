var utils = require('../../utils/util.js');
var app = getApp();
Page({

  data: {
    subject:'天津蓝天羽毛球俱乐部活动',
    address:'正能量羽毛球馆',
    court: 'VIP 1-5号',
    limit:30,
    price: '单次男45，女35，学生优惠25；包月300；',
    activityDate: utils.formatDay(new Date),
    activityTime: '晚19点至22点',
    comments: '俱乐部每周三周六晚19点至22点活动,欢迎使用小程序直接报名最近一次活动;如有朋友需要报名，可点击右上角的三个点转发',
    isAdmin: false,
  },

  onLoad: function (options) {

    const db = wx.cloud.database();
    wx.cloud.callFunction({
      name: "login",
      success: res =>{
          const user_openid = res.result.openid;          
          db.collection("user_info").where({
            "_openid": user_openid,
            }).get().then(res => {
              if (res.data.length ==1) {
                if (res.data[0].role == 'admin'){
                  this.setData({
                    isAdmin: true,
                  });
                }
              };
            })
      }
    })
    
  },

  onShow: function () {
    this.onLoad()
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
    }
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
        'status': "new",
        'club_id': 1,
      }
      }).then(res=>{
      console.log(res);
      
      wx.showToast({
        title: "创建成功！"
      })

      setTimeout(function(){
        wx.switchTab({
          url: '/pages/enroll/enroll',  
      })
      },1000)      
    });
  }
})