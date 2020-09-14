const URL = "https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json";

function GET (url){
    return new Promise((resolve, reject) => {
       let req = new XMLHttpRequest();
       req.open('get', url)
       req.onload = function(){
           if(req.status == 200){
               resolve(JSON.parse(req.responseText));
           } else {
               reject(req.status);
           }
       }
       req.send();
    });
} 


function processEventCorrelations(dataEvents) {
    // Obtener todos los nombres de eventos.
    const eventsCorrelationsPredata = {};
    for(let dateEvent of dataEvents){
        for(let event of dateEvent.events)
            eventsCorrelationsPredata[event] = {
                TP: 0, TN: 0, FP: 0, FN: 0
            };
    }

    // Calcular TP (true positves), TN (true Negatives), FP (False positives) y FN(false negatives
    for(let dateEvent of dataEvents){
        for(let eventName in eventsCorrelationsPredata){
            // Obtiene variables booleanos por si los eventos sucedieron
            let exist = dateEvent.events.includes(eventName);
            let {squirrel} = dateEvent;

            // Segun el caso clasifica
            if(!squirrel && !exist ) eventsCorrelationsPredata[eventName]["TN"] += 1;
            if(!squirrel && exist) eventsCorrelationsPredata[eventName]["FN"] += 1;
            if(squirrel && !exist) eventsCorrelationsPredata[eventName]["FP"] += 1;
            if(squirrel && exist) eventsCorrelationsPredata[eventName]["TP"] += 1;
        }
    }

    // Calcula el MCC
    const correlations = []
    for(let eventName in eventsCorrelationsPredata){
        let {TN, FN, FP, TP} = eventsCorrelationsPredata[eventName];
        
        let numerador = (TP * TN) - (FP * FN);
        let denominador = Math.sqrt((TP + FP) * (TP + FN) * (TN + FP) * (TN + FN)) 

        correlations.push({
            event: eventName,
            correlation: numerador/denominador
        })
    }

    // Ordena las correlaciones
    correlations.sort((a, b) => {
        if(a.correlation > b.correlation)
            return -1;
        else if(a.correlation < b.correlation)
            return 1;
        else
            return 0;
    })

    return correlations;
}

window.addEventListener("DOMContentLoaded", async function() {
    /**
     * Show all events
     */
    const events = await GET(URL);

    // Find element
    const tableEvents = document.getElementById("tableEvents");

    for(let i = 0; i < events.length;i++){
        let event = events[i];

        let row = tableEvents.insertRow(-1);

        let position = row.insertCell(0);
        position.innerHTML = i+1;

        let setEvents = row.insertCell(1);
        setEvents.innerHTML = event.events;

        let squirrel = row.insertCell(2);
        squirrel.innerHTML = event.squirrel;

        // Highlight in red
        if(event.squirrel)
            row.style.backgroundColor = "#ff8080";
    }

    /**
     * Show events correlations
     */
    const eventCorrelations = processEventCorrelations(events);
    
    
    // Find element
    const tableIndividualEvents = document.getElementById("tableIndividualEvents");

    for(let i = 0; i < eventCorrelations.length;i++){
        let event = eventCorrelations[i];

        let row = tableIndividualEvents.insertRow(-1);

        let position = row.insertCell(0);
        position.innerHTML = i+1;

        let setEvents = row.insertCell(1);
        setEvents.innerHTML = event.event;

        let correlation = row.insertCell(2);
        correlation.innerHTML = event.correlation;
    }

}, false);