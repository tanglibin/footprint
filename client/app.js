App({
  onLaunch: function () {
    if (wx.cloud) {
      wx.cloud.init({
        traceUser: true,
      });
    }
    this.globalData = {
      mapAk: ''//腾讯地图申请的key
    };
  }
});