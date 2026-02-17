// Fetch and parse JSON events, then render them on the timeline
async function loadTimeline() {
    try {
        // Fetch the events.json file
        const response = await fetch('events.json');
        if (!response.ok) {
            throw new Error('Failed to load events.json');
        }
        
        const events = await response.json();
        
        // Sort events by date
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Render events on the timeline
        renderTimeline(events);
    } catch (error) {
        console.error('Error loading timeline:', error);
        document.getElementById('timeline').innerHTML = '<p style="color: red;">Error loading events. Please check the console.</p>';
    }
}

// Function to render events on the timeline
function renderTimeline(events) {
    const timelineContainer = document.getElementById('timeline');
    timelineContainer.innerHTML = ''; // Clear existing content
    
    if (events.length === 0) {
        timelineContainer.innerHTML = '<p>No events found.</p>';
        return;
    }
    
    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'timeline-event';
        
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        eventElement.innerHTML = `
            <h3>${event.title || 'Untitled Event'}</h3>
            <p>${event.description || 'No description available'}</p>
            <time>${formattedDate}</time>
        `;
        
        timelineContainer.appendChild(eventElement);
    });
}

// Load the timeline when the page loads
document.addEventListener('DOMContentLoaded', loadTimeline);