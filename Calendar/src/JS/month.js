var todayDate;

function init(){
    todayDate = new Date();
    displayMonthGrid();
}

function displayMonthGrid(){
    //stores the amount of days in current month
    let daysInMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
    //stores the day of week of the first day of the month
    let dayOfWeekFirstDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1).getDay();
    //stores the day of week of the final day of the month
    let dayOfWeekFinalDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), daysInMonth).getDay();

    //extra grid to add at beginning
    let daysToAddBeginning = dayOfWeekFirstDay - 1;
    //extra grid to add at end
    let daysToAddEnd = 7 - dayOfWeekFinalDay;

    let prevMonth = {month: todayDate.getMonth() - 1, daysInMonth: new Date(todayDate.getFullYear(), todayDate.getMonth(), 0).getDate(), year: todayDate.getFullYear()};
    let nextMonth = {month: todayDate.getMonth() + 1, daysInMonth: new Date(todayDate.getFullYear(), todayDate.getMonth() + 2, 0).getDate(), year: todayDate.getFullYear()};

    // prevMonth.daysInMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 0).getDate();
    // prevMonth.number = todayDate.getMonth() - 1;
    // nextMonth.daysInMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 2, 0).getDate();
    // nextMonth.number = todayDate.getMonth() + 1;

    if(todayDate.getMonth() == 0){ //current month is january
        prevMonth.daysInMonth = 31;
        prevMonth.month = 11;
        prevMonth.year = todayDate.getFullYear() - 1;
    }else if(todayDate.getMonth() == 11){ //current month is december
        nextMonth.daysInMonth = 31;
        nextMonth.month = 0;
        nextMonth.year = todayDate.getFullYear() + 1;
    }

    let totalAmountOfGrid = daysToAddBeginning + daysInMonth + daysToAddEnd;
    let tempCounter = 1;
    let tempCurrentMonthCounter = 1;
    for(let i = 0; i < totalAmountOfGrid; i++){
        if(i < daysToAddBeginning){ //previous month
            let div = document.createElement("div");
            div.setAttribute('id','m'+ prevMonth.month + "d" + ((prevMonth.daysInMonth - daysToAddBeginning + 1) + i));

            if((new Date(prevMonth.year, prev.month, ((prevMonth.daysInMonth - daysToAddBeginning + 1) + i)).getDay() == 0) || (new Date(prevMonth.year, prev.month, ((prevMonth.daysInMonth - daysToAddBeginning + 1) + i)).getDay() == 6)){
                div.setAttribute('class','month-grid-element weekend-element');
            }else{
                div.setAttribute('class','month-grid-element');
            }

            let p = document.createElement("p");
            p.innerText = ((prevMonth.daysInMonth - daysToAddBeginning + 1) + i);
            div.appendChild(p);
            document.getElementById("month-grid-container").appendChild(div);
        }else if(i > (daysToAddBeginning + daysInMonth)){ //next month
            let div = document.createElement("div");
            div.setAttribute('id','m'+ nextMonth.month + "d"+tempCounter);

            if((new Date(nextMonth.year, nextMonth.month, tempCounter).getDay() == 0) || (new Date(nextMonth.year, nextMonth.month, tempCounter).getDay() == 6)){
                div.setAttribute('class','month-grid-element weekend-element');
            }else{
                div.setAttribute('class','month-grid-element');
            }
            
            let p = document.createElement("p");
            p.innerText = tempCounter;
            div.appendChild(p);
            document.getElementById("month-grid-container").appendChild(div);
            tempCounter++;
        }else{ //current month
            let div = document.createElement("div");
            div.setAttribute('id','m'+ todayDate.getMonth()+"d"+tempCurrentMonthCounter);

            if((new Date(todayDate.getFullYear(), todayDate.getMonth(), tempCurrentMonthCounter).getDay() == 0) || (new Date(todayDate.getFullYear(), todayDate.getMonth(), tempCurrentMonthCounter).getDay() == 6)){
                //console.log(new Date(todayDate.getFullYear(), todayDate.getMonth(), 9).getDate());
                div.setAttribute('class','month-grid-element weekend-element');
            }else{
                div.setAttribute('class','month-grid-element');
            }

            let p = document.createElement("p");
            p.innerText = tempCurrentMonthCounter;
            div.appendChild(p);
            document.getElementById("month-grid-container").appendChild(div);
            tempCurrentMonthCounter++;
        }
        
    }
}