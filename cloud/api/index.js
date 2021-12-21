const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

/**新增标注 */
function addMark(data){
  const {date, lng, lat, nation, province, city, userInfo} = data;
  const openid = userInfo.openId;
  return new Promise( (resolve, reject) => {
    db.collection('marks').where({openid, province, city}).get().then(res => {
      if(res.data.length){
        resolve({code:2}); //已存在
      }else{
        db.collection('marks').add({ data: {openid, date, lng, lat, nation, province, city}}).then(res => {
          resolve({code:0});//新增成功
        }).catch(()=>{
          resolve({code:1});
        })
      }
    }).catch(()=>{
      resolve({code:1});
    })
  })
}

/**删除标注 */
function delMark(data){
  return new Promise( (resolve, reject) => {
    db.collection('marks').doc(data.id).remove().then(resolve).catch((x)=>{
      resolve({code:1})
    })
  })
}

/**获取记录 */
function getList(data){
  return new Promise( (resolve, reject) => {
    const openid = data.userInfo.openId;
    db.collection('marks').where({openid}).get().then(res => {
      resolve(res.data);
    }).catch(()=>{
      resolve({code:1});
    })
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'addMark': //新增标注
      return addMark(event);
    case 'delMark': //删除标注
      return delMark(event);
    case 'getList': //获取记录
        return getList(event);
  }
};
