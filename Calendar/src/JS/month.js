//const storage = require('electron-storage');
const fs = require('fs');

let currentShownDate;
let showingTodayMonth = false; //true -> current month that is being shown is the current month of the system

var todayDate;
var todayWeek = {prevMonth: false, nextMonth: false, range: []}; //object - stores information the current week
let daysInMonth;
let dayOfWeekFirstDay;
let dayOfWeekFinalDay;
let daysToAddBeginning;
let daysToAddEnd;
let prevMonth = {month: 0, daysInMonth: 0, year: 0};
let nextMonth;

let currSelectedEvent = []; //stores a collection of currently selected events

function init(){
    todayDate = new Date();
    currentShownDate = todayDate;
    showCurrentMonth();
    //document.onclick = unfocus();
    document.addEventListener("click",unfocus, false);
}

function getMonthName(){
    switch(currentShownDate.getMonth()){
        case 0: 
            return "January";
        case 1: 
            return "February";
        case 2: 
            return "March";
        case 3: 
            return "April";
        case 4: 
            return "May";
        case 5: 
            return "June";
        case 6: 
            return "July";
        case 7: 
            return "August";
        case 8: 
            return "September";
        case 9: 
            return "October";
        case 10: 
            return "November";
        case 11: 
            return "December";
    }
}


//returns information about the current week
function getCurrentWeek(){
    if(!showingTodayMonth){
       return; 
    }
    console.log("past if");
    //today.getDate() - today.getDay()
    for(let i = 0; i < 7; i++){
        todayWeek.range.push(new Date(todayDate.getFullYear(), todayDate.getMonth(), (todayDate.getDate() - todayDate.getDay()) + i).getDate());
    }
    if(todayDate.getDate() - todayDate.getDay() <= 0){ //theres overlap to previous month
        todayWeek.prevMonth = true;
    }else if(todayWeek.range[0] > todayWeek.range[6]){ //theres overlap to next month
        todayWeek.nextMonth = true;
    }
}

function showPrevMonth(){
    if(currentShownDate.getMonth() == 0){//check if in january
        currentShownDate = new Date(currentShownDate.getFullYear() - 1, 11, 1);
    }else{
        currentShownDate = new Date(currentShownDate.getFullYear(), currentShownDate.getMonth() - 1, 1);
    }
    
    showCurrentMonth();
}

function showCurrentMonth(){
    if(currentShownDate.getMonth() == todayDate.getMonth()){
        showingTodayMonth = true;
    }else{
        showingTodayMonth = false;
    }
    getCurrentWeek();
    //stores the amount of days in current month
    daysInMonth = new Date(currentShownDate.getFullYear(), currentShownDate.getMonth() + 1, 0).getDate();
    //stores the day of week of the first day of the month
    dayOfWeekFirstDay = new Date(currentShownDate.getFullYear(), currentShownDate.getMonth(), 1).getDay();
    //stores the day of week of the final day of the month
    dayOfWeekFinalDay = new Date(currentShownDate.getFullYear(), currentShownDate.getMonth(), daysInMonth).getDay();

    prevMonth = {month: currentShownDate.getMonth() - 1, daysInMonth: new Date(currentShownDate.getFullYear(), currentShownDate.getMonth(), 0).getDate(), year: currentShownDate.getFullYear()};
    nextMonth = {month: currentShownDate.getMonth() + 1, daysInMonth: new Date(currentShownDate.getFullYear(), currentShownDate.getMonth() + 2, 0).getDate(), year: currentShownDate.getFullYear()};
    
    document.getElementById("month-id").innerText = getMonthName() +" "+ currentShownDate.getFullYear();
    
    displayMonthGrid();
}

function showNextMonth(){
    if(currentShownDate.getMonth() == 11){//check if in december
        currentShownDate = new Date(currentShownDate.getFullYear()+ 1, 0, 1);
    }else{
        currentShownDate = new Date(currentShownDate.getFullYear(), currentShownDate.getMonth() + 1, 1);
    }
    
    showCurrentMonth();
}

function unfocus(){
    console.log("in unfocus");
    console.log(currSelectedEvent.length);
    for(let i = 0; i < currSelectedEvent.length; i++){
        document.getElementById(currSelectedEvent[i]).classList.toggle("event-selected");
    }
    currSelectedEvent = [];
}

//stores the amount of events for a given date
let eventCounter = 1;
function addEventToCalendar(id){
    unfocus();
    console.log("in elem1");
    let div = document.createElement("div");
    div.setAttribute("id", id +"e"+eventCounter);
    div.classList.add("event");

    //selects element from the start
    div.classList.add("event-selected");
    currSelectedEvent.push(id +"e"+eventCounter);

    //draggable 
    div.setAttribute("draggable", "true");

    //events listeners for the specific event
    div.addEventListener("dblclick",eventDblClicked, false);
    div.addEventListener("click",eventSelected, false);
    div.addEventListener("dragstart",dragStart, false);

    let p = document.createElement("p");
    p.innerText = "New Event";
    p.setAttribute("class","event-name");
    let time = document.createElement("p");
    time.innerText = "2:35 PM"; 
    time.setAttribute("class","event-time");
    let circle = document.createElement("div");
    circle.setAttribute("class","circle");
    div.appendChild(circle);
    div.appendChild(p);
    div.appendChild(time);
    document.getElementById(id).appendChild(div);
    eventCounter++;
}

function eventDblClicked(e){
    e.stopPropagation();

}

function eventSelected(e){
    console.log(e.target.id);
    if(e.ctrlKey){//ctrl key was used
        document.getElementById(e.target.id).classList.add("event-selected");
        currSelectedEvent.push(e.target.id);
    }else{
        unfocus();
        document.getElementById(e.target.id).classList.add("event-selected");
        currSelectedEvent.push(e.target.id);
    }
    e.stopPropagation();
}

//NOTE: try to add support for dragging multiple elements
function dragStart(e){
    unfocus();
    document.getElementById(e.target.id).classList.add("event-selected");
    currSelectedEvent.push(e.target.id);
    console.log(e.target.id);
    e.dataTransfer.setData('text/plain',e.target.id);
    e.stopPropagation();
}


function displayMonthGrid(){
    document.getElementById("month-grid-container").innerHTML = "";
    //extra grid to add at beginning
    daysToAddBeginning = dayOfWeekFirstDay;
    
    //extra grid to add at end
    daysToAddEnd = 7 - dayOfWeekFinalDay;

    if(currentShownDate.getMonth() == 0){ //current month is january
        prevMonth.daysInMonth = 31;
        prevMonth.month = 11;
        prevMonth.year = currentShownDate.getFullYear() - 1;
    }else if(currentShownDate.getMonth() == 11){ //current month is december
        nextMonth.daysInMonth = 31;
        nextMonth.month = 0;
        nextMonth.year = currentShownDate.getFullYear() + 1;
    }
    
    let totalAmountOfGrid = daysToAddBeginning + daysInMonth + daysToAddEnd;
    
    let tempCounter = 1;
    let tempCurrentMonthCounter = 1;
    for(let i = 0; i < totalAmountOfGrid; i++){
        if(i < daysToAddBeginning){ //previous month
            let div = document.createElement("div");
            div.setAttribute('id','m'+ prevMonth.month + "d" + ((prevMonth.daysInMonth - daysToAddBeginning + 1) + i)); 
            

            if((new Date(prevMonth.year, prevMonth.month, ((prevMonth.daysInMonth - daysToAddBeginning + 1) + i)).getDay() == 0) || (new Date(prevMonth.year, prevMonth.month, ((prevMonth.daysInMonth - daysToAddBeginning + 1) + i)).getDay() == 6)){
                div.setAttribute('class','month-grid-element weekend-element not-current-month');
                
            }else{
                div.setAttribute('class','month-grid-element not-current-month');
            }

            if(todayWeek.prevMonth){ //overlaps prev month
                if(todayWeek.range.includes(((prevMonth.daysInMonth - daysToAddBeginning + 1) + i))){
                    //div.className += " current-week";
                    div.classList.add("current-week");
                }
            }
            div.setAttribute('ondblclick','addEventToCalendar(id);');


            let p = document.createElement("p");
            p.innerText = ((prevMonth.daysInMonth - daysToAddBeginning + 1) + i);
            div.appendChild(p);
            div.addEventListener("dragenter", dragEnter,false);
            div.addEventListener("dragover", dragOver,false);
            div.addEventListener("drop", drop,false);
            document.getElementById("month-grid-container").appendChild(div);
        }else if(i > (daysToAddBeginning + daysInMonth)){ //next month
            let div = document.createElement("div");
            div.setAttribute('id','m'+ nextMonth.month + "d"+tempCounter);

            if((new Date(nextMonth.year, nextMonth.month, tempCounter).getDay() == 0) || (new Date(nextMonth.year, nextMonth.month, tempCounter).getDay() == 6)){
                div.setAttribute('class','month-grid-element weekend-element not-current-month');
            }else{
                div.setAttribute('class','month-grid-element not-current-month');
            }
            
            if(todayWeek.nextMonth){
                if(todayWeek.range.includes(tempCounter)){
                    div.classList.add("current-week");
                }
            }

            div.setAttribute('ondblclick','addEventToCalendar(id);');

            let p = document.createElement("p");
            p.innerText = tempCounter;
            div.appendChild(p);
            div.addEventListener("dragenter", dragEnter,false);
            div.addEventListener("dragover", dragOver,false);
            div.addEventListener("drop", drop,false);
            document.getElementById("month-grid-container").appendChild(div);
            tempCounter++;
        }else{ //current month
            if(!(tempCurrentMonthCounter > daysInMonth)){
                let div = document.createElement("div");
                div.setAttribute('id','m'+ currentShownDate.getMonth()+"d"+tempCurrentMonthCounter);

                if((new Date(currentShownDate.getFullYear(), currentShownDate.getMonth(), tempCurrentMonthCounter).getDay() == 0) || (new Date(currentShownDate.getFullYear(), currentShownDate.getMonth(), tempCurrentMonthCounter).getDay() == 6)){
                    div.setAttribute('class','month-grid-element weekend-element');
                }else{
                    div.setAttribute('class','month-grid-element');
                }

                if(tempCurrentMonthCounter == todayDate.getDate() && showingTodayMonth){
                    //div.className += " current-date";
                    div.classList.add("current-date");
                }

                if(todayWeek.range.includes(tempCurrentMonthCounter) && showingTodayMonth){
                    //div.className += " current-week";
                    div.classList.add("current-week");
                }

                div.setAttribute('ondblclick','addEventToCalendar(id);');

                let p = document.createElement("p");
                p.innerText = tempCurrentMonthCounter;
                div.appendChild(p);
                div.addEventListener("dragenter", dragEnter,false);
                div.addEventListener("dragover", dragOver,false);
                div.addEventListener("drop", drop,false);
                document.getElementById("month-grid-container").appendChild(div);
                tempCurrentMonthCounter++;
            }
        }
        
    }

    function drop(e){
        console.log(e.target.id);
        const id = e.dataTransfer.getData('text/plain');
        const draggable = document.getElementById(id);

        e.target.appendChild(draggable);
        e.stopPropagation();
    }

    function dragEnter(e){
        e.preventDefault();
    }

    function dragOver(e){
        e.preventDefault();
    }
}