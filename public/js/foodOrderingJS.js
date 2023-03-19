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


next.addEventListener('click', function(event){
  event.preventDefault();
  console.log("What is this ? " + counterList);
  fetch('/ordered-food', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(counterList)
  })
  .then(response => response.text())
  .then(html => {
    // Replace the contents of the current page with the response HTML
    document.open();
    document.write(html);
    document.close();
  })
  .catch(error => console.error(error));
});