/* ═══ BAZI (八字速配) ═══ */
const TIAN=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const DI=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const WUXING_T=["木","木","火","火","土","土","金","金","水","水"];
const WUXING_D=["水","土","木","木","土","火","火","土","金","金","土","水"];
export const SHENGXIAO=["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
export const BAZI_MATCH=[
  {type:"天作之合",desc:"你们的八字五行互补得恰到好处，日柱相合，简直是教科书级别的般配。这种缘分在命理学上被称为「天赐良缘」，不是你们自己找到了对方，是命运把你们推到了一起。在一起不需要太多磨合，自然而然就能找到舒服的节奏。",score:95},
  {type:"良缘佳偶",desc:"八字整体和谐，五行之间有良好的互补关系。虽然有一两处小摩擦的地方，但都在可控范围内，不影响大局。你们的关系底色是温暖的，偶尔的争执反而是调味料。",score:85},
  {type:"欢喜冤家",desc:"你们的八字有互相吸引的地方，也有互相较劲的地方。像磁铁的两极——靠近时吸力强大，但翻个面就互相排斥。在一起不会无聊，这是确定的。但也不会太安稳。",score:70},
  {type:"磨合考验",desc:"五行上有一些冲突，属于需要「修炼」的缘分。不是天生就合拍，但也不是完全不搭——更像是两块形状不太一样的拼图，需要找到正确的角度才能拼在一起。",score:55},
  {type:"道阻且长",desc:"八字冲突比较明显，五行上存在较强的克制关系。说实话，在一起不是不可以，但你们需要做好心理准备：这段关系会比大多数人的更辛苦。",score:40},
  {type:"此生过客",desc:"八字显示你们更适合做朋友、知己，或者人生中一段重要但不是永久的缘分。有些人出现在你生命里不是为了留下，是为了教会你一些事情。",score:25},
];

export function calcBazi(y,m,d){
  var t=(y-4)%10;if(t<0)t+=10;
  var di=(y-4)%12;if(di<0)di+=12;
  var mBase=((y%5)*2+m+1)%10;
  var md=(y*12+m+13)%12;
  var dd=(Math.floor((Date.UTC(y,m-1,d)/86400000)+10)%60);
  var dt=dd%10;var ddi=dd%12;
  return{yearT:t,yearD:di,monthT:mBase%10,monthD:md,dayT:dt,dayD:ddi,sx:SHENGXIAO[di]};
}

export function baziCompat(b1,b2){
  var score=50;
  var w1=WUXING_T[b1.dayT],w2=WUXING_T[b2.dayT];
  var sheng={"木":"火","火":"土","土":"金","金":"水","水":"木"};
  var ke={"木":"土","土":"水","水":"火","火":"金","金":"木"};
  if(sheng[w1]===w2||sheng[w2]===w1)score+=20;
  if(ke[w1]===w2||ke[w2]===w1)score-=15;
  if(w1===w2)score+=10;
  var he6=[[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
  he6.forEach(function(p){if((b1.dayD===p[0]&&b2.dayD===p[1])||(b1.dayD===p[1]&&b2.dayD===p[0]))score+=15});
  var chong=[[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
  chong.forEach(function(p){if((b1.yearD===p[0]&&b2.yearD===p[1])||(b1.yearD===p[1]&&b2.yearD===p[0]))score-=10});
  if(score>90)score=95;if(score<10)score=15;
  score=Math.max(15,Math.min(95,score));
  var idx=score>=90?0:score>=75?1:score>=60?2:score>=45?3:score>=30?4:5;
  return{score:score,info:BAZI_MATCH[idx],w1:w1,w2:w2,sx1:b1.sx,sx2:b2.sx,gz1:TIAN[b1.dayT]+DI[b1.dayD],gz2:TIAN[b2.dayT]+DI[b2.dayD]};
}
