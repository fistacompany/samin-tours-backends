const API_URL = 'http://localhost:5001/api';
let allBookings = [];

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

// Load all bookings
async function loadBookings() {
    try {
        const authHeader = getAuthHeader();
        if (!authHeader) return;

        const response = await fetch(`${API_URL}/bookings`, {
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
            allBookings = result.data;
            displayBookings(allBookings);
        } else {
            alert('Failed to load bookings');
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('bookingsTable').innerHTML = '<tr><td colspan="10" class="loading">Error loading bookings</td></tr>';
    }
}

// Display bookings in table
function displayBookings(bookings) {
    const tbody = document.getElementById('bookingsTable');

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="loading">No bookings yet</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(booking => {
        const date = new Date(booking.created_at).toLocaleString();
        const carName = booking.car_id ? booking.car_id.name : 'N/A';

        return `
      <tr>
        <td>#${booking._id.slice(-6)}</td>
        <td>${date}</td>
        <td>${carName}</td>
        <td>${booking.customer_name || 'N/A'}</td>
        <td>${booking.customer_phone}</td>
        <td>
          <div style="font-size: 12px;">
            <div>📍 ${booking.pickup_address.substring(0, 30)}...</div>
            <div>🎯 ${booking.destination_address.substring(0, 30)}...</div>
          </div>
        </td>
        <td>${booking.distance_km} km</td>
        <td>₹${booking.fare_amount}</td>
        <td>
          <span class="status-badge ${booking.status}">
            ${booking.status}
          </span>
        </td>
        <td>
          <select onchange="updateStatus('${booking._id}', this.value)" style="padding: 4px 8px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); font-size: 12px;">
            <option value="">Change Status</option>
            <option value="pending" ${booking.status === 'pending' ? 'disabled' : ''}>Pending</option>
            <option value="confirmed" ${booking.status === 'confirmed' ? 'disabled' : ''}>Confirmed</option>
            <option value="cancelled" ${booking.status === 'cancelled' ? 'disabled' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `;
    }).join('');
}

// Filter bookings by status
function filterBookings() {
    const statusFilter = document.getElementById('statusFilter').value;

    if (!statusFilter) {
        displayBookings(allBookings);
    } else {
        const filtered = allBookings.filter(b => b.status === statusFilter);
        displayBookings(filtered);
    }
}

// Update booking status
async function updateStatus(id, status) {
    if (!status) return;

    try {
        const authHeader = getAuthHeader();
        if (!authHeader) return;

        const response = await fetch(`${API_URL}/bookings/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        const result = await response.json();

        if (result.success) {
            alert('Booking status updated successfully');
            loadBookings();
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status');
    }
}

// Load bookings on page load
loadBookings();
