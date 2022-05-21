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

let calendarTypes = ['day', 'week', 'month']



let popupOnloadEventColor; //stores the color of the event to create based on the previous event color

let listOfCalendars = [{name: "School", color:"blue", checked: false}, 
                        {name: "Work", color:"red", checked: true},
                        {name:"Home", color:"white", checked: false}]; //stores a list of all created calendar, eg: School, Work, etc
    //{name: 'School', color: 'blue', checked: false}

let testEvent = {fromYear: 2022, fromMonth: 5, fromDay: 21, fromHour: 12, fromMin: 30, 
                toYear: 2022, toMonth: 5, toDay: 21, toHour: 13, toMin: 30, 
                repeat: [], alert: [], invitees: [], url: "", note: ""};

let eventCollection = {School:{testEvent}, Work:{}, Home:{}}; //stores the entire collection of event // temporary


function init(){
    todayDate = new Date();
    currentShownDate = todayDate;
    showCurrentMonth();
    showCalendars();
    //document.onclick = unfocus();
    document.addEventListener("click",unfocus, false);
    document.getElementById("event-popup").addEventListener("click",popupClicked, false);

    setDefaultValueEventPopup();
    showEventsOnCalendar();
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

/* when document is clicked */
function unfocus(){
    for(let i = 0; i < currSelectedEvent.length; i++){
        document.getElementById(currSelectedEvent[i]).classList.toggle("event-selected");
    }
    currSelectedEvent = [];
    closeEventPopup();
}

//stores the amount of events for a given date
let eventCounter = 1;
function addEventToCalendar(id, eventInfo, eventName){
    
    console.log(id);
    unfocus();
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

    let eventNameText = "New event";
    let timeText = "12:00 PM";

    if(eventInfo){
        eventNameText =  eventName;
        if(eventInfo.fromHour > 11){ //set AM
            timeText = eventInfo.fromHour + ":" + eventInfo.fromMin + " AM";
        }else{ //set PM
            timeText = eventInfo.fromHour + ":" + eventInfo.fromMin + " PM";
        }
        
    }

    let p = document.createElement("p");
    p.innerText = eventNameText;
    p.setAttribute("class","event-name");
    let time = document.createElement("p");
    time.innerText = timeText; 
    time.setAttribute("class","event-time");
    let circle = document.createElement("div");
    circle.setAttribute("class","circle");
    div.appendChild(circle);
    div.appendChild(p);
    div.appendChild(time);
    document.getElementById(id).appendChild(div);
    if(!eventInfo){
        openEventPopup(id +"e"+eventCounter, false);
    }
    
    eventCounter++;
}

function showEventsOnCalendar(){
    eventCollection
    for(let i = 0; i < Object.keys(eventCollection).length; i++){ //iterate through all calendar categories
        let calendarName = Object.keys(eventCollection)[i];
        console.log(calendarName);
        let eventArr = Object.values(eventCollection)[i];
        console.log(eventArr);
        for(let j = 0; j < Object.keys(eventArr).length; j++){
            let eventName = Object.keys(eventArr)[j];
            console.log(eventName);
            let eventInfo = Object.values(eventArr)[j]; 
            console.log(eventInfo);
            console.log(eventInfo.fromYear);
            let dayId = "m"+(eventInfo.fromMonth - 1)+"d"+eventInfo.fromDay;
            addEventToCalendar(dayId, eventInfo, eventName);
        }
    }
}

function eventDblClicked(e){
    e.stopPropagation();
    openEventPopup(e.target.id, true);
}

function eventSelected(e){
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

/* opens the the popup to add an event, id => the id of the event */
function openEventPopup(id, exist){
    setEventPopupLocation(document.getElementById(id).getBoundingClientRect(), document.getElementById(id).clientWidth);
    document.getElementById("event-popup").classList.remove("event-popup-hidden");
    document.getElementById("popup-arrow").classList.remove("event-popup-hidden");

    if(exist){ //event already exists -> show event's info
        console.log("Event exists");
    }else{ //new event is going to be created -> show default info
        console.log("new event");
        setDefaultValueEventPopup();
    }

}
/* closes the the popup to add an event */
function closeEventPopup(){
    if(document.getElementById("event-popup").classList.contains("event-popup-hidden")){
        return;
    }
    document.getElementById("event-popup").classList.add("event-popup-hidden");
    document.getElementById("popup-arrow").classList.add("event-popup-hidden");
}

function popupClicked(e){
    if(e){
        e.stopPropagation();
        console.log("popup clicked");
    }
}

function setDefaultValueEventPopup(){
    document.getElementById("from-time").value = '12:00';
    //document.getElementById("from-time-meridiem").options[1].selected = true;
    document.getElementById("to-time").value = '13:00';
    //document.getElementById("to-time-meridiem").options[1].selected = true;
}

function timeChange(e){
    console.log(e);
    updateEventTime();
}

//in charge of changing the start and end of the event
function updateEventTime(){
    let fromTime = timeStringToInt(document.getElementById("from-time").value); //new time from
    let toTime = timeStringToInt(document.getElementById("to-time").value); //old time to
    let timeDiff = toTime - fromTime;
    console.log(fromTime);
    toTime = toTime + timeDiff;
    //newTimeHour = parseInt(newTimeHour) + 1;
    document.getElementById("to-time").value = (newTimeHour + ":" + newTimeMin);
}

function timeStringToInt(string){
    let hour = string.substring(0,2);
    let min = string.substring(3,5);
    return parseInt(hour+min);
}

/* Sets the colour of the specific event */
function setEventColor(){

}

/* Sets the location of the event popup depending where the event is on the page */
function setEventPopupLocation(offsets, width){
    
    let r = document.querySelector(':root');

    let rs = getComputedStyle(r);

    let eventPopupWidth = strip(rs.getPropertyValue('--event-popup-width'));
    let eventPopupHeight = strip(rs.getPropertyValue('--event-popup-height'));
    
    //popup
    let popupLeft = width + offsets.left;
    let popupTop = offsets.top - 40;
    
    //popup arrow
    let arrowLeft = width + offsets.left - 20;
    let arrowTop = offsets.top - 5;
    let arrowDirection = false; //false -> left, true -> right
    

    if(((window.innerHeight - popupTop) < eventPopupHeight) && ((window.innerWidth - popupLeft) < eventPopupWidth)){//checking if event is too low AND too right so event-popup needs to display higher and on left side of event
        popupTop = window.innerHeight - eventPopupHeight - 15;
        popupLeft = popupLeft - width - eventPopupWidth;
        arrowDirection = true;
        arrowLeft = arrowLeft - width + 20;
    }else if((window.innerHeight - popupTop) < eventPopupHeight){//checking if event is too low so event-popup needs to display higher
        popupTop = window.innerHeight - eventPopupHeight - 15;
    }else if((window.innerWidth - popupLeft) < eventPopupWidth){//checking if event is too right so event-popup needs to display left
        popupLeft = popupLeft - width - eventPopupWidth;
        arrowDirection = true;
        arrowLeft = arrowLeft - width + 20;;
    }
    if(arrowDirection){ //arrow is pointing right
        document.getElementById("popup-arrow").classList.remove("event-popup-arrow-left");
        document.getElementById("popup-arrow").classList.add("event-popup-arrow-right");
        console.log("in arrow right");
    }else{//arrow is pointing left
        document.getElementById("popup-arrow").classList.remove("event-popup-arrow-right");
        document.getElementById("popup-arrow").classList.add("event-popup-arrow-left");
        console.log("in arrow left");
    }

    r.style.setProperty('--event-popup-arrow-top', arrowTop);
    r.style.setProperty('--event-popup-arrow-left', arrowLeft);

    r.style.setProperty('--event-popup-top', popupTop);
    r.style.setProperty('--event-popup-left', popupLeft);

}



function allDayClicked(e){
    let checkbox = document.getElementById('all-day-toggle');
    if(checkbox.checked){ //checkbox IS checked
        document.getElementById('from-time').classList.add('all-day-selected');
        document.getElementById('from-time-meridiem').classList.add('all-day-selected');
        document.getElementById('to-time').classList.add('all-day-selected');
        document.getElementById('to-time-meridiem').classList.add('all-day-selected');
    }else{ //checkbox is NOT checked
        document.getElementById('from-time').classList.remove('all-day-selected');
        document.getElementById('from-time-meridiem').classList.remove('all-day-selected');
        document.getElementById('to-time').classList.remove('all-day-selected');
        document.getElementById('to-time-meridiem').classList.remove('all-day-selected');
    }
}


/* strips a string that has units and returns the value, characters => is what is needed to be removed, string => being removed from */
function strip(string){
    if(string.includes("px")){
        return parseInt((string.slice(0, string.length - 2)).trim());
    }else if(string.includes("background-color:")){
        return (string.slice(17, string.length - 1)).trim();
    }

}

//NOTE: try to add support for dragging multiple elements
function dragStart(e){
    unfocus();
    document.getElementById(e.target.id).classList.add("event-selected");
    currSelectedEvent.push(e.target.id);
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
}

function drop(e){
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


/* CALENDER LIST / LEFT SIDE */
function showCalendars(){
    for(let i = 0; i < listOfCalendars.length; i++){
        let container = document.createElement('div');
        container.setAttribute('class', 'individual-calendar-container' );
        container.setAttribute('id', 'container' + listOfCalendars[i].name);
        let checkbox = document.createElement('input');
        checkbox.setAttribute('type','checkbox');
        checkbox.setAttribute('id', listOfCalendars[i].name);
        checkbox.setAttribute('class', 'calendar-checkbox');
        if(listOfCalendars[i].checked){
            checkbox.classList.add("not-checked");
        }else{
            checkbox.classList.add("checked");
        }
        let circle = document.createElement('div');
        circle.classList.add("circle");
        circle.classList.add("individual-calendar-circle");
        circle.style["background-color"] = listOfCalendars[i].color;
        circle.addEventListener("click", changeCalendarColor, false)

        let label = document.createElement('label');
        label.innerText = listOfCalendars[i].name;
        checkbox.checked = listOfCalendars[i].checked;

        container.appendChild(checkbox);
        container.appendChild(circle);
        container.appendChild(label);
        document.getElementById('list-of-calendars').appendChild(container);
    }
}

//event when a calendar checkmark is toggled -> show or not show the corresponding calendar categories in the whole calendar
function calendarToggle(){

}

function changeCalendarColor(e){
    e.stopPropagation();
    console.log(e);
    console.log(strip(e.target.attributes.style.value));
    strip(e.target.attributes.style.value); //gets the string value of the current color of a calendar
}

/* CALENDAR FOOTER / BOTTOM */
function calendarTypeToggle(id){
    console.log(id);
    document.getElementById("day").classList.remove("calendar-type-toggle-selected");
    document.getElementById("week").classList.remove("calendar-type-toggle-selected");
    document.getElementById("month").classList.remove("calendar-type-toggle-selected");
    document.getElementById(id).classList.add("calendar-type-toggle-selected");
}

