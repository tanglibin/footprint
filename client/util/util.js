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
      date = date || this.formatDate(new Date());
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
    },

    /**日期格式化 */
    formatDate(date, format='yyyy-MM-dd'){
      const o = {
          'M+': date.getMonth() + 1, //月份
          'd+': date.getDate(), //日
          'h+': date.getHours(), //小时
          'm+': date.getMinutes(), //分
          's+': date.getSeconds() //秒
      };
      if (/(y+)/.test(format)) {
          format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
      }
      for (let k in o) {
          if (new RegExp('(' + k + ')').test(format)) {
              format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
          }
      }
      return format;
  }
}

module.exports = Util;