// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the button and gallery elements
const getImagesBtn = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// NASA APOD API key (replace DEMO_KEY with your own key below)
const NASA_API_KEY = 'A3jnwFfaltLj0BqyAlmLXGQJQS412PgEla2oTiFq'; // Your personal API key
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

// --- Random Space Fact Section ---
// Array of fun space facts
const spaceFacts = [
  "A day on Venus is longer than a year on Venus!",
  "Neutron stars can spin at a rate of 600 rotations per second!",
  "There are more trees on Earth than stars in the Milky Way!",
  "The footprints on the Moon will be there for millions of years.",
  "Jupiter's Great Red Spot is a giant storm bigger than Earth!",
  "One million Earths could fit inside the Sun!",
  "Space is completely silent—there's no air to carry sound.",
  "The hottest planet in our solar system is Venus.",
  "The International Space Station travels at 28,000 km/h!",
  "A spoonful of a neutron star weighs about a billion tons!"
];

// Pick a random fact
const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

// Create and insert the fact section above the gallery
const factSection = document.createElement('div');
factSection.className = 'space-fact';
factSection.innerHTML = `<strong>Did You Know?</strong> <span>${randomFact}</span>`;
const container = document.querySelector('.container');
container.insertBefore(factSection, document.getElementById('gallery'));

// Function to show a loading message
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos…</p>
    </div>
  `;
}

// Function to show an error message
function showError(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🚫</div>
      <p>${message}</p>
    </div>
  `;
}

// Function to create the gallery from NASA data
function showGallery(images) {
  // Remove the placeholder
  gallery.innerHTML = '';

  // Loop through each image and create a gallery item
  images.forEach(item => {
    // Handle images and videos
    const div = document.createElement('div');
    div.className = 'gallery-item';
    if (item.media_type === 'image') {
      div.innerHTML = `
        <img src="${item.url}" alt="${item.title}" />
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      `;
      // Add a click event to open the modal
      div.addEventListener('click', () => openModal(item));
    } else if (item.media_type === 'video') {
      // If it's a YouTube video, embed it, otherwise show a link
      let videoEmbed = '';
      if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        // Embed YouTube video
        videoEmbed = `<div class="video-wrapper"><iframe src="${item.url.replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen></iframe></div>`;
      } else {
        // Show a clickable link for other videos
        videoEmbed = `<a href="${item.url}" target="_blank" class="video-link">Watch Video</a>`;
      }
      div.innerHTML = `
        ${videoEmbed}
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      `;
    }
    gallery.appendChild(div);
  });
}

// Function to fetch images from NASA API
async function fetchImages(startDate, endDate) {
  showLoading();
  try {
    // Build the API URL with parameters
    const url = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Could not fetch images.');
    const data = await response.json();
    // The API returns an array of image objects
    showGallery(data);
  } catch (error) {
    showError(error.message);
  }
}

// Listen for button click to get images
getImagesBtn.addEventListener('click', () => {
  // Get the selected dates
  const startDate = startInput.value;
  const endDate = endInput.value;
  // Only fetch if both dates are selected
  if (startDate && endDate) {
    fetchImages(startDate, endDate);
  } else {
    showError('Please select a start and end date.');
  }
});

// Modal functionality
// Create modal elements
const modal = document.createElement('div');
modal.id = 'modal';
modal.style.display = 'none';
modal.style.position = 'fixed';
modal.style.top = '0';
modal.style.left = '0';
modal.style.width = '100vw';
modal.style.height = '100vh';
modal.style.background = 'rgba(0,0,0,0.8)';
modal.style.justifyContent = 'center';
modal.style.alignItems = 'center';
modal.style.zIndex = '1000';
modal.innerHTML = `
  <div id="modal-content" style="background: #fff; color: #212121; border-radius: 10px; max-width: 700px; width: 90vw; padding: 20px; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: 'Verdana', Arial, sans-serif;">
    <button id="modal-close" style="position: absolute; top: 10px; right: 10px; background: #e03c31; color: #fff; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
      <span aria-hidden="true">&times;</span>
    </button>
    <img id="modal-img" src="" alt="" style="width: 100%; max-height: 400px; object-fit: contain; border-radius: 6px; background: #000;" />
    <h2 id="modal-title" style="margin-top: 15px; font-family: 'Verdana', Arial, sans-serif; color: #e03c31;">Title</h2>
    <p id="modal-date" style="font-weight: bold; color: #005288;">Date</p>
    <p id="modal-explanation" style="margin-top: 10px; color: #212121;">Explanation</p>
  </div>
`;
document.body.appendChild(modal);

// Accessibility: set ARIA attributes for modal
modal.setAttribute('role', 'dialog');
modal.setAttribute('aria-modal', 'true');
modal.setAttribute('aria-hidden', 'true');
modal.setAttribute('aria-label', 'Image details');

// Update openModal and closeModal to toggle ARIA attributes and focus
function openModal(item) {
  document.getElementById('modal-img').src = item.hdurl || item.url;
  document.getElementById('modal-img').alt = item.title;
  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-date').textContent = item.date;
  document.getElementById('modal-explanation').textContent = item.explanation;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('modal-close').focus(); // Focus close button for keyboard users
}

function closeModal() {
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  getImagesBtn.focus(); // Return focus to main action button
}

// Close modal on button click or background click
modal.addEventListener('click', (e) => {
  // Check if the click is on the modal background or any part of the close button
  if (
    e.target === modal ||
    e.target.id === 'modal-close' ||
    (e.target.closest && e.target.closest('#modal-close'))
  ) {
    closeModal();
  }
});

// Optional: Close modal with Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// NASA branding: update fonts and colors for modal and gallery
// (See inline styles above for modal. For more, update style.css as needed.)

// Add NASA logo to the top left of the page header (already present in index.html)
// Add a footer to the page
const footer = document.createElement('footer');
footer.className = 'site-footer';
footer.innerHTML = `
  <img src="img/NASA-Logo-Large.jpg" alt="NASA Insignia" class="footer-logo" />
  <p>NASA Space Explorer &copy; 2025. Not an official NASA site.</p>
`;
document.body.appendChild(footer);
