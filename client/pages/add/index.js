var Util = require('../../util/util.js');
var Region = require('../../libs/region/region.min.js');
Page({
  data: {
    date: '',//到达时间
    province: '',//省
    city: '',//市
    lng: '',//经度
    lat: '',//纬度
    region: Region, //城市数据

    show: false, //是否显示城市选择浮层
    provinceActive: 0, //省选择
    cityActive: '', //市选择
  },

  /**时间选择 */
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  /**经度输入 */
  bindLngInput: function (e) {
    this.cleanData();
    this.setData({
      lng: e.detail.value
    })
  },

  /**纬度输入 */
  bindLatInput: function (e) {
    this.cleanData();
    this.setData({
      lat: e.detail.value
    })
  },

  /**打开城市选择浮层 */
  openRegion(){
    this.cleanData();
    this.setData({
      show: true
    })
  },

  /**还原数据 */
  cleanData(){
    this.setData({
      province: '',
      city: '',
      provinceActive: 0,
      cityActive: '',
    })
  },

  /**省选择 */
  chooseProvince(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      provinceActive: index,
      cityActive: '',
    })
  },

  /**市选择 */
  chooseCity(e){
    let {c, p} = e.currentTarget.dataset;
    this.setData({
      provinceActive: p,
      cityActive: c,
    })
  },

  /**完成城市选择 */
  select(){
    const {provinceActive, cityActive} = this.data;
    let obj = {show: false, lng: '',lat: ''}; //选择城市，清空经纬度
    if(cityActive !== ''){
      if(!provinceActive){
        obj.province = Region[0]['city'][cityActive];
      }else{
        let sel = Region[provinceActive];
        obj.province = sel.province;
        obj.city = sel.city[cityActive];
      }
    }
    this.setData(obj);
  },

  /**新增保存 */
  save(){
    let {date, province, city, lng, lat} = this.data;
    let param = {date, province, city, lng, lat};

    if(!date || (!province && !(lng && lat))){
      wx.showToast({ title: '内容填写不完整', icon: "error" });
      return false;
    }
    // 有城市- 根据城市名称获取对应经纬度
    if(province){
      Util.geocoder(province+city).then(res => {
        Object.assign(param, {lng: res.lng, lat: res.lat});
        this.saveRequest(param);
      });
    }
    // 没城市-根据经纬度获取城市
    else{
      Util.reverseGeocoder({latitude: lat, longitude: lng}).then(res => {
        Object.assign(param, res);
        this.saveRequest(param);
      })
    }
  },

   /**请求新增 */
   saveRequest(param){
    Util.addMark(param).then( () => {
      wx.navigateTo({url: '/pages/list/index'});
    })
  },
  onShareAppMessage() {},
  onShareTimeline(){},
   /**不加动画不生效 */
   onEnter(res) {},
});