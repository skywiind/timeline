// script.js

// Function to parse JSON events and render them on a timeline
function renderTimeline(events) {
    const timelineContainer = document.getElementById('timeline');
    timelineContainer.innerHTML = ''; // Clear existing content

    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'timeline-event';
        eventElement.innerHTML = `
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <time>${new Date(event.date).toUTCString()}</time>
        `;
        timelineContainer.appendChild(eventElement);
    });
}

// Example usage (mock data)
const events = [
    { title: 'Event 1', description: 'Description for event 1', date: '2026-05-01T10:00:00Z' },
    { title: 'Event 2', description: 'Description for event 2', date: '2026-06-01T12:00:00Z' }
];

renderTimeline(events);