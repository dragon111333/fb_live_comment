const axios = require("axios");
const fs = require("fs");
const videoData = require("./videoData.json");
const code = "ok";
const fileLogPath = "member.csv";

//-----------1----------
 function getComment(){
    let url = "https://graph.facebook.com/v11.0/"+videoData["videoID"]+"/comments?access_token="+videoData["accessToken"];
    return axios.get(url).then((response)=>{
        return(response.data.data);
    });
}
//-----------2------------
function dropDublicate(oldComment,newComment){
    return new Promise((resolve,reject)=>{
        newComment.map((val,index)=>{
            if(oldComment.find(oldRows=>oldRows.id==val.id)==undefined){
                writeMemberFile(val);
            }
        });
        resolve(newComment)
    })
}
//-----------3-------------
function writeMemberFile(memberData){
   try {
    console.log(memberData);
    if(String(memberData.message).substring(0,code.length).toLowerCase()==code.toLowerCase()){
        let row = memberData.from.id+","+memberData.from.name+","+memberData.message+","+memberData.created_time+"\n";
        fs.appendFileSync(fileLogPath,row,"utf8");
    }
   } catch (e) {
       console.log("write file error--->",e);
   }
}

 function main(){
    let firstRound = true;
    let tempComment = [];
    setInterval(async ()=>{
        if(!firstRound){
            let newComment = await getComment();
            tempComment = await dropDublicate(tempComment,newComment);
        }else{
            fs.writeFileSync(fileLogPath,"\ufeffThis ไอดีคอมเม้น,ชื่อโปรไฟล์,รหัส,เวลา\n","utf8");
            tempComment  = await getComment();
            tempComment.map((val,index)=>{
                writeMemberFile(val);
            });
            firstRound = false;
        }
    },10000);
}
main();
