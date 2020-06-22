//app.js
App({

  globalData: {
    userInfo: null,
    nickName: "",
  },

  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {};
    this.loadUserInfo();
  },

  is_login: function(){
    if (this.globalData.userInfo){
      return true;
    }else{
      return false;
    }
  }, 

  setUserInfo: function(userInfo){
    this.globalData.userInfo = userInfo;
  },

  getUserInfo: function(){
    return this.globalData.userInfo;
  },

  loadUserInfo: function(){
    const that = this;
    wx.getSetting({
      success: res=>{
        const isUserInfo = res.authSetting['scope.userInfo'];
        if (isUserInfo){
          wx.getUserInfo({
            success: res=>{
              const userInfo = res.userInfo;
              that.globalData.nickName = userInfo.nickName;
              that.globalData.userInfo = userInfo;
            }
          })
        }
      }
    })
  }
})
