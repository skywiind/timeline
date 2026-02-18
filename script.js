// Fetch and parse JSON events, then render them on the timeline
async function loadTimeline() {
    try {
        // Fetch the events.json file
        const response = await fetch('events.json');
        if (!response.ok) {
            throw new Error('Failed to load events.json');
        }
        
        const timeline = await response.json();
        
        const seasons = timeline.seasons;

        // Sort events by date
        seasons.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Render events on the timeline
        renderTimeline(seasons);
    } catch (error) {
        console.error('Error loading timeline:', error);
        document.getElementById('timeline').innerHTML = '<p style="color: red;">Error loading events. Please check the console.</p>';
    }
}

// Function to render events on the timeline with horizontal scrolling
function renderTimeline(seasons) {
    var stylesheet = document.styleSheets[0];

    const timelineContainer = document.getElementById('timeline');
    timelineContainer.innerHTML = ''; // Clear existing content
    
    if (seasons.length === 0) {
        timelineContainer.innerHTML = '<p>No events found.</p>';
        return;
    }

    //timeline length in days
    var timelineLength = dateIntervalDays(seasons[0].startDate, seasons[seasons.length - 1].endDate);
    console.log(timelineLength);

    //number of events
    var numEvents = 0;

    //size of one event card in px (fornow)
    var eventScale = 350;

    seasons.forEach(season => {
        timelineLength += seasonLength(season);
        numEvents += season.events.length;

        const seasonElement = document.createElement('div');
        seasonElement.className = 'timeline-season';
        seasonElement.id = season.title;

        timelineContainer.appendChild(seasonElement);
        
        renderEvents(season.events, season.title);
    });

    // Compute season proportions and expose them as CSS variables
    seasons.forEach(season => {
        console.log(season.title);
        var proportionalLength = (Math.round(((seasonLength(season) / timelineLength) + Number.EPSILON) * 100) / 100) * (numEvents * eventScale);

        const seasonElement = document.getElementById(season.title);
        if (seasonElement) {
            seasonElement.style.setProperty('--season-proportion', proportionalLength);
            const styleRule = `#${season.title}.timeline-season { ${backgroundGradient(season.color)} }`
            console.log(styleRule)
            stylesheet.insertRule(styleRule);
        }
    });
    
}

//return the CSS property for a background gradient that is pleasing based on the input color
function backgroundGradient(hexColor) {
    var hslColor = rgbToHsl(hexColor);
    var hue = hslColor[0];
    var sat = hslColor[1];
    var lum = hslColor[2];

    console.log(`${hue}, ${sat}, ${lum}`);

    var newHue = hslAdd(hue, -.1);
    var newSat = hslAdd(sat, -.1);
    var newLum = hslAdd(lum, -.05);

    console.log(`${newHue}, ${newSat}, ${newLum}`);

    var gradientColor = hslToRgb(newHue, newSat, newLum);
    console.log("gradient color: " + gradientColor);

    const a = [.5, .5, .5];
    const b = [.5, .5, .5];
    const c = [1, 1, 1];
    const d = rgbHexToPercent(hexColor);

    gradientColor = generateColor(a, b, c, d);

    return `background: linear-gradient(180deg, ${hexColor} 0%, ${gradientColor} 100%);`
}

//all 3D vector inputs
function generateColor(vecA, vecB, vecC, vecD) {
    var r = 0.0;
    var g = 0.0;
    var b = 0.0;

    console.log(vecA);

    r = vecA[0] + vecB[0] * (Math.cos(2 * Math.PI * (vecC[0] * .1 + vecD[0])));
    g = vecA[1] + vecB[1] * (Math.cos(2 * Math.PI * (vecC[1] * .3 + vecD[1])));
    b = vecA[2] + vecB[2] * (Math.cos(2 * Math.PI * (vecC[2] * .9 + vecD[2])));

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    return `#${r.toString(16).padEnd(2, '0')}${g.toString(16).padEnd(2, '0')}${b.toString(16).padEnd(2, '0')}`;
}

//do HSL math, both inputs in percent
function hslAdd(value, addend) {
    if (addend === 0) {
        return value;
    }
    //scale to 100, modify with correct modulus, modulus 100 normally, scale back to 1
    const output = (((value * 100) + (mod((addend * 100), 100))) % 100) / 100;
    return output;
}

//modulus that is correctly defined over negatives because why the fuck not
function mod(a, n) {
    return a - (n * Math.floor(a/n));
}

function rgbToHsl(color){
    var rgbVec = rgbHexToPercent(color);
    var r = rgbVec[0];
    var g = rgbVec[1];
    var b = rgbVec[2];
    
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return rgbPercentToHex(r, g, b);
}

function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

//rgb hex string to array of percentages
function rgbHexToPercent(color) {
    var r = parseInt(color.substr(1,2), 16);
    var g = parseInt(color.substr(3,2), 16);
    var b = parseInt(color.substr(5,2), 16);

    r /= 255, g /= 255, b /= 255;
    
    return [r, g, b];
}

//array of rgb percentages to hex string
function rgbPercentToHex(r, g, b) {
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    return `#${r.toString(16).padEnd(2, '0')}${g.toString(16).padEnd(2, '0')}${b.toString(16).padEnd(2, '0')}`;
}

//returns length of a season in days
function seasonLength(season) {
    return dateIntervalDays(season.startDate, season.endDate);
}

//returns date interval in days
function dateIntervalDays(a, b) {
    const startDate = new Date(a);
    const endDate = new Date(b);

    return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
}

//render the events in an array loaded from season (/arc)
function renderEvents(events, seasonTitle) {
    const seasonContainer = document.getElementById(seasonTitle);
    seasonContainer.innerHTML = '';

    if (events.length === 0 ) {
        seasonContainer.innerHTML = '<p>No events found.</p>';
        return;
    }

    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'timeline-event';
        
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        eventElement.innerHTML = `
            <div class="event-marker"></div>
            <div class="event-content">
                <h3>${event.title || 'Untitled Event'}</h3>
                <p>${event.description || 'No description available'}</p>
                <time>${formattedDate}</time>
            </div>
        `;
        
        seasonContainer.appendChild(eventElement);
    });
}

// Load the timeline when the page loads
document.addEventListener('DOMContentLoaded', loadTimeline);
