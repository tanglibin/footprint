var Util = require('../../util/util.js');
Page({
  data: {
    show: false, //当前位置没有添加过时，显示是否点亮当前位置提醒
    locationAddr: null, //当前位置
    markers: [], //标注
    nations: [], //国家
  },
  /**初始化 */
  onLoad() {
    // 获取用户定位信息 & 获取用户已有记录
    Promise.all([this.getLocation(), this.getMarks()]).then(res => {
      const local = res[0];
      const markList = res[1] || [];
      let markData = [];
      let status = true;
      let nations = new Set();

      markList.forEach(({nation, province, city, lat, lng}) => {
        nations.add(nation);
        // 添加标注
        markData.push({latitude: lat, longitude: lng, title: nation == '中国' ? city : (nation+'-'+province) });
        // 判断当前地址是否已记录
        if(local){
          let reg1 = new RegExp('^' + province);
          let reg2 = new RegExp('^' + city);
          if(reg1.test(local.province) && reg2.test(local.city)){
            status = false;
          }
        }
      })
      // 绑定数据
      this.setData({
        markers: markData,
        show: status,
        nations: Array.from(nations)
      })
    })
  },

  /**获取用户定位经纬度 */
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation().then(res => {
        // 坐标位置转描述
        Util.reverseGeocoder(res).then(data => {
          let {nation, province, city, lng, lat} = data;
          let str = province + city;
          if(nation != '中国'){
            str = nation + str;
          }
          this.setData({
            locationAddr: {nation, province, city, lng, lat, str}
          })
          resolve({province, city});
        }).catch(r => {resolve()});
      }).catch(r => {resolve()});
    })
  },

  /**获取已标注记录 */
  getMarks(){
    return new Promise((resolve, reject) => {
      wx.showLoading();
      wx.cloud.callFunction({
        name: 'api',
        data: { type: 'getList' }
      }).then( ({result}) =>{
        const {code} = result;
        if(code){
          wx.showToast({ title: '记录获取失败', icon: "error"});
          resolve();
        }else{
          resolve(result);
        }
      }).catch(r => {resolve()}).finally(()=>{
        wx.hideLoading();
      })
    })
  },

  /**关闭浮层 */
  exit(){
    this.setData({show: false})
  },

  /**点亮当前位置 */
  save(){
    let {locationAddr, nations, markers} = this.data;
    Util.addMark(locationAddr).then( () => {
      let {lng, lat, nation, province, city} = locationAddr;
      markers.push({latitude: lat, longitude: lng, title: nation == '中国' ? city : (nation+'-'+province) });
      if(!nations.includes(nation)){
        nations.push(nation);
      }
      this.setData({
        markers,
        nations,
        show: false
      });
    })
  },

  /**前往新增足迹页面 */
  add(){
    wx.navigateTo({url: '/pages/add/index'})
  },

  /**前往记录详情页面 */
  goInfo(){
    this.data.markers.length && wx.navigateTo({url: '/pages/info/index'})
  },

  /**不加动画不生效 */
  onEnter(res) {},
  onShareAppMessage() {},
  onShareTimeline(){}
});