document.addEventListener('DOMContentLoaded', function() {
    const qcRegisterForm = document.getElementById('qcRegisterForm');
    
    qcRegisterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Collect all form data
        const formData = {
            record_date: document.getElementById('record_date').value,
            disa_line: document.getElementById('disa_line').value,
            part_name: document.getElementById('part_name').value,
            heat_code: document.getElementById('heat_code').value,
            qty_moulds: parseInt(document.getElementById('qty_moulds').value) || null,
            remarks: document.getElementById('remarks').value,
            
            // Metal Composition 1
            c1: parseFloat(document.getElementById('c1').value) || null,
            si1: parseFloat(document.getElementById('si1').value) || null,
            mn1: parseFloat(document.getElementById('mn1').value) || null,
            p1: parseFloat(document.getElementById('p1').value) || null,
            s1: parseFloat(document.getElementById('s1').value) || null,
            mg1: parseFloat(document.getElementById('mg1').value) || null,
            f_l1: parseFloat(document.getElementById('f_l1').value) || null,
            cu1: parseFloat(document.getElementById('cu1').value) || null,
            cr1: parseFloat(document.getElementById('cr1').value) || null,
            
            // Metal Composition 2
            c2: parseFloat(document.getElementById('c2').value) || null,
            si2: parseFloat(document.getElementById('si2').value) || null,
            mn2: parseFloat(document.getElementById('mn2').value) || null,
            s2: parseFloat(document.getElementById('s2').value) || null,
            cr2: parseFloat(document.getElementById('cr2').value) || null,
            cu2: parseFloat(document.getElementById('cu2').value) || null,
            sn2: parseFloat(document.getElementById('sn2').value) || null,
            
            // Pouring Parameters
            pouring_time: document.getElementById('pouring_time').value || null,
            pouring_temp: parseFloat(document.getElementById('pouring_temp').value) || null,
            pp_code: document.getElementById('pp_code').value || null,
            fc_no_heat_no: document.getElementById('fc_no_heat_no').value || null,
            
            // Magnesium Treatment
            mg_kgs: parseFloat(document.getElementById('mg_kgs').value) || null,
            res_mg: parseFloat(document.getElementById('res_mg').value) || null,
            converter_percent: parseFloat(document.getElementById('converter_percent').value) || null,
            rec_mg_percent: parseFloat(document.getElementById('rec_mg_percent').value) || null,
            stream_innoculat: parseFloat(document.getElementById('stream_innoculat').value) || null,
            p_time_sec: parseFloat(document.getElementById('p_time_sec').value) || null,
            
            // Tapping Information
            treatment_no: document.getElementById('treatment_no').value || null,
            con_no: document.getElementById('con_no').value || null,
            tapping_time: document.getElementById('tapping_time').value || null,
            corrective_addition_kgs: parseFloat(document.getElementById('corrective_addition_kgs').value) || null,
            tapping_wt_kgs: parseFloat(document.getElementById('tapping_wt_kgs').value) || null
        };
        
        // Basic validation for required fields
        if (!formData.record_date || !formData.part_name || !formData.heat_code) {
            showMessage('Please fill all required fields (Record Date, Part Name, Heat Code)', 'error');
            return;
        }
        
        try {
            // Submit form data to backend
            const response = await fetch('http://localhost:3000/api/qc-register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Show success message
                showMessage('QC Register data submitted successfully!', 'success');
                // Reset the form after successful submission
                qcRegisterForm.reset();
            } else {
                // Show error message from backend
                showMessage(`Error: ${result.error || 'Failed to submit data'}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting QC Register data:', error);
            showMessage('Connection error: Please check your network', 'error');
        }
    });
    
    // Function to show status messages
    function showMessage(message, type) {
        const messageDiv = document.getElementById('responseMessage');
        messageDiv.textContent = message;
        messageDiv.className = `response ${type}`;
        messageDiv.style.display = 'block';
        
        // Hide the message after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
});
