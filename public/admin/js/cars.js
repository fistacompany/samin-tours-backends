const API_URL = 'https://samin-tours-backends.onrender.com/api';
let currentCarId = null;

// Get admin credentials from localStorage or redirect to login
function getAuthHeader() {
    const credentials = localStorage.getItem('adminCredentials');
    if (!credentials) {
        window.location.href = '/admin/login.html';
        return null;
    }
    return `Basic ${credentials}`;
}

function logout() {
    localStorage.removeItem('adminCredentials');
    window.location.href = '/admin/login.html';
}

// Load all cars
async function loadCars() {
    try {
        const authHeader = getAuthHeader();
        if (!authHeader) return;

        const response = await fetch(`${API_URL}/cars/all`, {
            headers: {
                'Authorization': authHeader
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('adminCredentials');
            window.location.href = '/admin/login.html';
            return;
        }

        const result = await response.json();

        if (result.success) {
            displayCars(result.data);
        } else {
            alert('Failed to load cars');
        }
    } catch (error) {
        console.error('Error loading cars:', error);
        document.getElementById('carsGrid').innerHTML = '<p class="loading">Error loading cars</p>';
    }
}

// Display cars in grid
function displayCars(cars) {
    const grid = document.getElementById('carsGrid');

    if (cars.length === 0) {
        grid.innerHTML = '<p class="loading">No cars added yet. Click "Add New Car" to get started.</p>';
        return;
    }

    grid.innerHTML = cars.map(car => `
    <div class="car-card">
      <img src="https://samin-tours-backends.onrender.com${car.image_url}" alt="${car.name}">
      <h3>${car.name}</h3>
      <div class="car-info">
        <div>Base 100km: ₹${car.base_100km_fare}</div>
        <div>Extra per km: ₹${car.extra_per_km}</div>
      </div>
      <span class="car-status ${car.is_active ? 'active' : 'inactive'}">
        ${car.is_active ? 'Active' : 'Inactive'}
      </span>
      <div class="car-actions">
        <button onclick="editCar('${car._id}')" class="btn-primary btn-small">Edit</button>
        <button onclick="deleteCar('${car._id}')" class="btn-danger btn-small">Delete</button>
      </div>
    </div>
  `).join('');
}

// Show add car modal
function showAddCarModal() {
    currentCarId = null;
    document.getElementById('modalTitle').textContent = 'Add New Car';
    document.getElementById('carForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('carModal').classList.add('show');
}

// Edit car
async function editCar(id) {
    try {
        const authHeader = getAuthHeader();
        if (!authHeader) return;

        const response = await fetch(`${API_URL}/cars/all`, {
            headers: {
                'Authorization': authHeader
            }
        });

        const result = await response.json();
        const car = result.data.find(c => c._id === id);

        if (car) {
            currentCarId = id;
            document.getElementById('modalTitle').textContent = 'Edit Car';
            document.getElementById('carName').value = car.name;
            document.getElementById('baseFare').value = car.base_100km_fare;
            document.getElementById('extraPerKm').value = car.extra_per_km;
            document.getElementById('isActive').checked = car.is_active;
            document.getElementById('imagePreview').innerHTML = `
        <img src="https://samin-tours-backends.onrender.com${car.image_url}" alt="${car.name}">
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 5px;">Upload new image to replace</p>
      `;
            document.getElementById('carModal').classList.add('show');
        }
    } catch (error) {
        console.error('Error loading car:', error);
        alert('Failed to load car details');
    }
}

// Delete car
async function deleteCar(id) {
    if (!confirm('Are you sure you want to delete this car?')) {
        return;
    }

    try {
        const authHeader = getAuthHeader();
        if (!authHeader) return;

        const response = await fetch(`${API_URL}/cars/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader
            }
        });

        const result = await response.json();

        if (result.success) {
            alert('Car deleted successfully');
            loadCars();
        } else {
            alert('Failed to delete car');
        }
    } catch (error) {
        console.error('Error deleting car:', error);
        alert('Failed to delete car');
    }
}

// Close modal
function closeModal() {
    document.getElementById('carModal').classList.remove('show');
}

// Handle form submission
document.getElementById('carForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const authHeader = getAuthHeader();
    if (!authHeader) return;

    const formData = new FormData();
    formData.append('name', document.getElementById('carName').value);
    formData.append('base_100km_fare', document.getElementById('baseFare').value);
    formData.append('extra_per_km', document.getElementById('extraPerKm').value);
    formData.append('is_active', document.getElementById('isActive').checked);

    const imageFile = document.getElementById('carImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    } else if (!currentCarId) {
        alert('Please select a car image');
        return;
    }

    try {
        const url = currentCarId
            ? `${API_URL}/cars/${currentCarId}`
            : `${API_URL}/cars`;

        const method = currentCarId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': authHeader
            },
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert(currentCarId ? 'Car updated successfully' : 'Car added successfully');
            closeModal();
            loadCars();
        } else {
            alert('Failed to save car: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error saving car:', error);
        alert('Failed to save car');
    }
});

// Image preview
document.getElementById('carImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagePreview').innerHTML = `
        <img src="${e.target.result}" alt="Preview">
      `;
        };
        reader.readAsDataURL(file);
    }
});

// Load cars on page load
loadCars();
