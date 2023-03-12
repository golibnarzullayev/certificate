const moment = require('moment');

function textData(user, type) {
   const fullNameTextData = {
      text: user.fullName.toUpperCase(),
      placementX: type === 'davlat' ? 450 : 140,
      placementY: type === 'davlat' ? 730 : 850
   }

   const idTextData = {
      text: `ID: ${user.id}`,
      placementX: type === 'davlat' ? 2200 : 1860,
      placementY: type === 'davlat' ? 1650 : 1320
   }

   const dateTextData = {
      text: moment(new Date(user.date)).format('DD.MM.YYYY'),
      placementX: type === 'davlat' ? 1150 : 1845,
      placementY: type === 'davlat' ? 1130 : 1470
   }

   const data = {
      fullNameTextData,
      idTextData,
      dateTextData,
      id: user.id
   }

   return data;
}

module.exports = textData;