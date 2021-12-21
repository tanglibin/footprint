var QQMapWX = require('../libs/map/qqmap-wx-jssdk.min.js');
const MapContx = new QQMapWX({
  key: getApp().globalData.mapAk//腾讯地图申请的key
})
const Util = {
    /**地址解析(地址转坐标位置) */
    geocoder: function(address){
      wx.showLoading();
      return new Promise( (reslove, reject)=>{
        MapContx.geocoder({
          address, //地址
          success: function(res) {
            reslove(res.result.location);
          },
          fail: function(error) {
            wx.showToast({ title: '获取地址信息失败2', icon: "error" });
          },
          complete: ()=>{
            wx.hideLoading();
          }
        })
      })
    },

    /**逆地址解析(坐标位置转描述) */
    reverseGeocoder: function({latitude, longitude}){
        wx.showLoading();
        return new Promise( (reslove, reject)=>{
          MapContx.reverseGeocoder({
              location: {latitude, longitude},
              success: (res) => {
                let {nation, province, locality, city=''} = res.result.address_component;
                // 海外城市
                if(!province){
                  province = locality;
                }
                reslove({nation, province, city, lat: latitude, lng: longitude});
              },
              fail: ()=>{
                wx.showToast({ title: '获取地址信息失败1', icon: "error" });
              },
              complete: ()=>{
                wx.hideLoading();
              }
            })
        })
    },

    /**添加标注 */
    addMark({date, lng, lat, nation, province, city}){
      date = date || new Date().toLocaleString().substr(0, 10).replace(/\//g, '-');
      nation = nation || '中国';

      wx.showLoading();
      return new Promise( (reslove, reject)=>{
        wx.cloud.callFunction({
          name: 'api',
          data: {
            type: 'addMark',
            date, lng, lat, nation, province, city
          }
        }).then( res =>{
          const {code} = res.result;
          if(!code){
            wx.showToast({ title: '足迹新增成功!', icon: "success", duration: 2000 });
            setTimeout(reslove, 2000);
          }else{
            wx.showToast({ title: code==2 ? '记录已存在' : '网络异常', icon: "error", duration: 2000 });
          }
        }).finally(()=>{
          wx.hideLoading();
        })
      })
    }
}

module.exports = Util;