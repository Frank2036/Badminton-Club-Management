// miniprogram/pages/member/member.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    member: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const db = wx.cloud.database();
    var that = this;
    
    db.collection("user_info").limit(10).where({
      status: "new"
    }).get().then(res => {
      
      var member = res.data;
      for (var i = 0, len = res.data.length; i < len; i++){

        member[i].nickName = member[i].nickName.substr(0,8);
        
        if (member[i].gender == 0) {
          member[i].gender = "待定" 
        } else if (member[i].gender == 1) {
          member[i].gender = "男"
        } else {
          member[i].gender = "女"
        }
      } 
      this.setData({
        member:member,
      })
    })
  },

  onSubmitEvent(event){
    var that = this;

    const memberInfo = event.detail.value;
    console.log(memberInfo._id);
    const db = wx.cloud.database();
    db.collection('user_info').doc(memberInfo._id).update({
      data:{
        gender: memberInfo.gender,
        expenseType: memberInfo.expenseType,
        status: "confirmed"
      },
      success: function(res){
        console.log(memberInfo);
        wx.showToast({
          title: '更新成功'
        })
        setTimeout(function(){
          that.onLoad();
        },1500)
      }
    })
  },
  
  onReturnTabs: function() {
    wx.switchTab({
      url: '/pages/activity/activity'
    })
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