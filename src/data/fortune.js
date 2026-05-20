/* ═══ DAILY FORTUNE (今日运势) ═══ */
const FORTUNE_KW=["暗涌","破冰","回温","试探","拉扯","甜蜜","冷战","和解","心动","犹豫","错过","重逢","告白","放下","执念","自由","疗愈","觉醒"];
const FORTUNE_YI=["主动表白","约Ta出去","发那条消息","认真聊一次","牵手","说软话","承认错误","送小礼物","回忆甜蜜时刻","夸Ta"];
const FORTUNE_JI=["翻旧账","冷战","已读不回","说反话","跟前任联系","在朋友圈阴阳怪气","酒后发消息","查Ta手机","提分手试探","跟别人暧昧气Ta"];
const LUCKY_COLORS=["珊瑚粉——让你看起来更温柔","雾霾蓝——冷静但不冷漠","奶油白——给人安全感","薄荷绿——清新感满分","焦糖色——温暖且治愈","薰衣草紫——神秘又吸引人","蜜桃橙——活力四射甜甜的","烟灰色——高级又有距离感"];
const FORTUNE_MSG=["今天适合勇敢一点，最坏的结果不过是回到原点","有些话今天不说，明天就更说不出口了","今天的你散发着让人想靠近的气场","注意控制情绪，冲动是魔鬼","今天适合倾听，少说多听反而能收获更多","桃花运不错，出门记得打扮","今天的你需要独处充电，别勉强自己社交","有人在想你，但你可能猜不到是谁","旧的不去新的不来，放下才能拥有","直觉很准，如果感觉不对就是不对"];

export function calcFortune(month,day){
  var today=new Date();var ty=today.getFullYear(),tm=today.getMonth()+1,td=today.getDate();
  var seed=(ty*10000+tm*100+td)*31+(month*100+day)*17;
  var s=function(n){return((seed*n+7919)%10007)};
  var stars=s(1)%5+1;
  var kw1=FORTUNE_KW[s(2)%FORTUNE_KW.length],kw2=FORTUNE_KW[s(3)%FORTUNE_KW.length];
  var yi=FORTUNE_YI[s(4)%FORTUNE_YI.length];
  var ji=FORTUNE_JI[s(5)%FORTUNE_JI.length];
  var color=LUCKY_COLORS[s(6)%LUCKY_COLORS.length];
  var msg=FORTUNE_MSG[s(7)%FORTUNE_MSG.length];
  return{stars:stars,kw:[kw1,kw2],yi:yi,ji:ji,color:color,msg:msg};
}
