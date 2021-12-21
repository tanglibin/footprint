Page({
  data: {
    normalList: [], //原始数据
    cityList: [],//以城市分组数据
    dateList: [],//以年份分组数据
    tabIndex: 0, //0: 展示 cityList， 1：展示 dateList
    showDelBtn: false, //是否显示删除按钮

    delData: null,//删除数据对象
    show: false, //是否显示删除确认
  },
  onLoad(){
    this.getMarks();
  },
  /**获取已标注记录 */
  getMarks(){
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'api',
      data: { type: 'getList' }
    }).then( ({result}) =>{
      const {code} = result;
      if(code){
        wx.showToast({ title: '记录获取失败', icon: "error"});
        setTimeout(()=>{wx.navigateTo({url: '/pages/list/index'})}, 1500)
      }else{
        this.setData({normalList: result});
        this.formatData(result);
      }
    }).finally(()=>{
      wx.hideLoading();
    })
  },

  /**格式化数据 */
  formatData(list){
    // 按时间排序
    list.sort((i,j) => new Date(i.date) > new Date(j.date) ? 1 : -1);
    
    let obj_city = {};//以城市分组数据
    let obj_date = {};//以年份分组数据

    list.forEach(item => {
      item.province = item.province.replace(/省$/, '');
      item.city = item.city.replace(/市$/, '');

      // 按城市分组
      let key = item.nation == '中国' ? item.province : item.nation;
      obj_city[key] = obj_city[key] || [];
      obj_city[key].push(item);

      // 按年份分组
      let year = item.date.substr(0, 4);
      obj_date[year] = obj_date[year] || [];
      obj_date[year].push(item);
    });
    
    let cityList = [];//以城市分组数据
    for(let key in obj_city){
      cityList.push({
        title: key,
        list: obj_city[key]
      });
    }

    let dateList = [];//以年份分组数据
    for(let key in obj_date){
      dateList.push({
        title: key,
        list: obj_date[key]
      });
    }
    dateList.sort((i,j) => +i.title > +j.title ? 1 : -1);
    
    this.setData({cityList, dateList});
  },

  /**打开操作选项 */
  openSheet(){
    const that = this;
    const {showDelBtn} = that.data;
    wx.showActionSheet({
      itemList: ['按城市分组展示', '按年份时间线展示', showDelBtn ? '取消编辑' : '编辑'],
      success ({tapIndex}) {
        if(tapIndex == 2){
          that.setData({showDelBtn: !showDelBtn});
        }else{
          that.setData({tabIndex: tapIndex, showDelBtn:false});
        }
      }
    })
  },
  
  /**删除 */
  del(e){
    const {id, title} = e.currentTarget.dataset;
    this.setData({
      show: true,
      delData: {id, title}
    })
  },

  /**关闭浮层 */
  exit(){
    this.setData({show: false})
  },

  /**删除提交 */
  submit(){
    this.exit();

    const {id} = this.data.delData;
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'api',
      data: { type: 'delMark', id }
    }).then( res =>{
      const {code} = res.result;
      if(!code){
        wx.showToast({ title: '删除成功!', icon: "success"});
        this.flashStaticList(id);
      }else{
        wx.showToast({ title: '删除失败', icon: "error"});
      }
    }).finally(()=>{
      wx.hideLoading();
    })
  },

  /**本地数据刷新 */
  flashStaticList(id){
    let {normalList} = this.data;
    let index = normalList.findIndex(item => item._id == id);
    normalList.splice(index, 1);
    this.setData({normalList});
    this.formatData(normalList);
  },

  /**返回列表 */
  goback(){
    wx.navigateTo({url: '/pages/list/index'})
  },

  /**不加动画不生效 */
  onEnter(res) {},
  onShareAppMessage() {},
  onShareTimeline(){}
});