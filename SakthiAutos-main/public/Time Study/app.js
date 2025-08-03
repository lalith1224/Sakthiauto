// Handle form submission
document.getElementById('timeStudyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Collect data from form
    const data = {
        shift: document.getElementById('shift').value,
        c: parseFloat(document.getElementById('c').value) || null,
        si: parseFloat(document.getElementById('si').value) || null,
        mn: parseFloat(document.getElementById('mn').value) || null,
        p: parseFloat(document.getElementById('p').value) || null,
        s: parseFloat(document.getElementById('s').value) || null,
        cr: parseFloat(document.getElementById('cr').value) || null,
        ni: parseFloat(document.getElementById('ni').value) || null,
        al: parseFloat(document.getElementById('al').value) || null,
        cu: parseFloat(document.getElementById('cu').value) || null,
        sn: parseFloat(document.getElementById('sn').value) || null,
        mo: parseFloat(document.getElementById('mo').value) || null,
        cac2_s: parseFloat(document.getElementById('cac2_s').value) || null,
        fesi_sh: parseFloat(document.getElementById('fesi_sh').value) || null,
        femn_sic: parseFloat(document.getElementById('femn_sic').value) || null,
        cu_fecr: parseFloat(document.getElementById('cu_fecr').value) || null,
        carbon_steel: document.getElementById('carbon_steel').value || '',
        part_name: document.getElementById('part_name').value,
        heat_code: document.getElementById('heat_code').value,
        grade: document.getElementById('grade').value
    };
    
    // Validate required fields
    if (!data.shift || !data.part_name || !data.heat_code || !data.grade) {
        showMessage('Please fill all required fields (Shift, Part Name, Heat Code, Grade)', 'error');
        return;
    }
    
    try {
        // Send data to backend
        const response = await fetch('http://localhost:3000/api/time-study', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Show success message
            showMessage('Time study data submitted successfully!', 'success');
            // Reset form
            document.getElementById('timeStudyForm').reset();
        } else {
            // Show error message
            showMessage(`Error: ${result.error || 'Failed to submit time study data'}`, 'error');
        }
    } catch (error) {
        console.error('Error submitting time study data:', error);
        showMessage('Error connecting to server', 'error');
    }
});

// Show response messages
function showMessage(message, type) {
    const messageDiv = document.getElementById('responseMessage');
    messageDiv.textContent = message;
    messageDiv.className = `response-message ${type}`;
    messageDiv.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
