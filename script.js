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
    const timelineContainer = document.getElementById('timeline');
    timelineContainer.innerHTML = ''; // Clear existing content
    
    if (seasons.length === 0) {
        timelineContainer.innerHTML = '<p>No events found.</p>';
        return;
    }

    //timeline length in days
    var timelineLength = 0;

    seasons.forEach(season => {
        timelineLength += seasonLength(season);

        const seasonElement = document.createElement('div');
        seasonElement.className = 'timeline-season';
        seasonElement.id = season.title;

        timelineContainer.appendChild(seasonElement);
        
        renderEvents(season.events, season.title);
    });

    //compute timeline length and calculate season proportions
    seasons.forEach(season => {
        var proportionalLength = seasonLength(season) / timelineLength;

        proportionalLength = Math.round((proportionalLength + Number.EPSILON) * 100) / 100;

        console.log(season.title + " " + proportionalLength);

        
    });
    
}

//returns length of a season in days
function seasonLength(season) {
    const startDate = new Date(season.startDate);
    const endDate = new Date(season.endDate);

    const seasonLength = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

    return seasonLength;
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