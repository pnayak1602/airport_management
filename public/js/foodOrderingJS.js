let counterList = [];
const addBtn = document.getElementsByClassName('add-btn');
const counterSpan = document.getElementsByClassName('counter');
const next = document.getElementsByClassName('next')[0];
for(var i=0;i<addBtn.length;i++)
{
  counterList.push(0);
    addBtn[i].addEventListener('click', function() {
        console.log("Hello : " + this.id);
        counterList[this.id-1]++;
        console.log(counterSpan[this.id-1].innerHTML);
        counterSpan[this.id-1].innerHTML = counterList[this.id-1];
        next.classList.remove("btn-secondary");
        next.classList.add("btn-success");
      });
}
const clear = document.getElementsByClassName('clear')[0];
clear.addEventListener('click', function(){
  for(var j=0;j<addBtn.length;j++)
  {
    counterList[j] = 0;
    counterSpan[j].innerHTML = 0;
    next.classList.remove("btn-success");
    next.classList.add("btn-secondary");
    console.log(next.classList);
  }
});
// next.addEventListener("click", function(event) {
//   const xhr = new XMLHttpRequest();
//   const url = "http://localhost:3000/calculator";
//   xhr.open("POST", url);
//   xhr.setRequestHeader("Content-Type", "application/json");
//   const data = {
//     name : 'hello',
//     btn : addBtn,
//     quantity : counterList
//   };
//   const json = JSON.stringify(data);
//   xhr.send(json);  
// });
