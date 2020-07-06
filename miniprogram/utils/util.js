function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatDay(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1;
  if(month<10){
    month = 0+String(month)
  }
  var day = date.getDate()
  if(day<10){
    day = 0+String(day)
  }

  return year+'-'+month+'-'+day
}

module.exports = {
  formatTime: formatTime,
  formatDay: formatDay
}
