document.addEventListener('DOMContentLoaded', async () => {
    // Product selection elements
    const selectedComponentDisplay = document.getElementById('selected-component-display');
    const changeComponentButton = document.getElementById('change-component');
    const productModal = document.getElementById('product-modal');
    const modalSearchInput = document.getElementById('modal-search');
    const modalResultsContainer = document.getElementById('modal-results');
    const selectedComponentInput = document.getElementById('selected-component');
  
    // QC form elements
    const qcForm = document.getElementById('qc-form');
    const flowRateSettingInput = document.getElementById('flow-rate-setting');
    const flowRateDisplayInput = document.getElementById('flow-rate-display');
    const hotBoxTempInput = document.getElementById('hot-box-temp');
    const airPressureInput = document.getElementById('air-pressure');
    const injectPressureInput = document.getElementById('inject-pressure');
    const feedPipeConditionInput = document.getElementById('feed-pipe');
    const powderSizeInput = document.getElementById('powder-size');
    const moistureInput = document.getElementById('moisture');
    const isNewBagCheckbox = document.getElementById('is-new-bag');
    const airDrierCheckbox = document.getElementById('air-drier');
    const filterCleaningCheckbox = document.getElementById('filter-cleaning');
    const gaugeTestInput = document.getElementById('gauge-test');
  
    // Table elements
    const recordsTableBody = document.querySelector('#records-table tbody');
  
    let currentProduct = null;
    let hourlyTimer;
  
    // Function to fetch and display product search results
    async function searchProducts(query) {
      try {
        const response = await fetch(`http://localhost:3000/products/search?query=${query}`);
        const data = await response.json();
        displaySearchResults(data);
      } catch (error) {
        console.error('Error searching products:', error);
      }
    }
  
    // Function to display product search results in the modal
    function displaySearchResults(results) {
      modalResultsContainer.innerHTML = '';
      results.forEach(product => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.textContent = `${product.product_code}: ${product.product_description}`;
        resultItem.addEventListener('click', () => {
          selectProduct(product);
          closeProductModal();
        });
        modalResultsContainer.appendChild(resultItem);
      });
    }
  
    // Function to select a product and update the UI
    async function selectProduct(product) {
      currentProduct = product.product_code;
      selectedComponentInput.value = product.product_code;
      selectedComponentDisplay.textContent = `${product.product_code}: ${product.product_description}`;
      
      // Update the last_used timestamp in the database
      try {
        await fetch(`/update-last-used`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ product_code: product.product_code })
        });
      } catch (error) {
        console.error('Error updating last used timestamp:', error);
      }
      
      // Reset the hourly timer
      if (hourlyTimer) {
        clearTimeout(hourlyTimer);
      }
      startHourlyReminder();
      
      // Prefill the form with the latest data for this product
      await prefillHourlyForm();
    }
  
    // Function to open the product modal
    function openProductModal() {
      productModal.style.display = 'block';
      modalSearchInput.focus();
    }
  
    // Function to close the product modal
    function closeProductModal() {
      productModal.style.display = 'none';
      modalSearchInput.value = '';
      modalResultsContainer.innerHTML = '';
    }
  
    // Event listener for opening the product modal
    changeComponentButton.addEventListener('click', openProductModal);
  
    // Event listener for closing the product modal
    productModal.querySelector('.close').addEventListener('click', closeProductModal);
  
    // Event listener for product search input
    modalSearchInput.addEventListener('input', (event) => {
      const query = event.target.value.trim();
      searchProducts(query);
    });
  
    // Function to prefill the hourly form with the latest data
    async function prefillHourlyForm() {
      if (!currentProduct) return;
  
      try {
        const response = await fetch(`http://localhost:3000/qc/last?product=${currentProduct}`);
        const data = await response.json();
  
        if (data) {
          flowRateSettingInput.value = data.flow_rate_setting_a || '';
          flowRateDisplayInput.value = data.flow_rate_display_b || '';
          hotBoxTempInput.value = data.hot_box_temp || '';
          airPressureInput.value = data.air_pressure || '';
          injectPressureInput.value = data.inject_pressure || '';
          feedPipeConditionInput.value = data.feed_pipe_condition || '';
        }
      } catch (error) {
        console.error('Error fetching latest QC data:', error);
      }
    }
  
    // Function to start the hourly reminder
    function startHourlyReminder() {
      hourlyTimer = setTimeout(async () => {
        if (currentProduct && confirm('Time for hourly QC data entry. Prefill with latest data?')) {
          await prefillHourlyForm();
          // Focus on the first input field
          flowRateSettingInput.focus();
        }
        startHourlyReminder();
      }, 3600000); // 1 hour
    }
  
    // Event listener for QC form submission
    qcForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const qcData = {
        component_in_production: selectedComponentInput.value,
        flow_rate_setting_a: parseFloat(flowRateSettingInput.value),
        flow_rate_display_b: parseFloat(flowRateDisplayInput.value),
        hot_box_temp: parseFloat(hotBoxTempInput.value),
        air_pressure: parseFloat(airPressureInput.value),
        inject_pressure: parseFloat(injectPressureInput.value),
        feed_pipe_condition: feedPipeConditionInput.value,
        powder_size: parseFloat(powderSizeInput.value) || null,
        moisture: parseFloat(moistureInput.value) || null,
        is_new_bag: isNewBagCheckbox.checked,
        air_drier_function: airDrierCheckbox.checked,
        filter_cleaning: filterCleaningCheckbox.checked,
        gauge_test: parseFloat(gaugeTestInput.value) || null,
      };
  
      try {
        const response = await fetch('http://localhost:3000/api/qc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qcData)
        });
  
        if (response.ok) {
          alert('QC data submitted successfully!');
          // Reset the form
          qcForm.reset();
          //Prefill the hourly Form
          await prefillHourlyForm();
          // Optionally, reload the records table
          // loadQcRecords();
        } else {
          alert('Error submitting QC data: ' + response.statusText);
        }
      } catch (error) {
        console.error('Error submitting QC data:', error);
        alert('Failed to submit QC data.');
      }
    });
  
    // Start the hourly reminder and prefill form if a product is selected
    startHourlyReminder();
  
    // ✅ Hot Box Temp Validation (already present)
  
      const hotBoxTempError = document.getElementById("hotboxtemerror");
  
      hotBoxTempInput.addEventListener("blur", validateHotBoxTemp);
      hotBoxTempInput.addEventListener("input", validateHotBoxTemp);
  
      function validateHotBoxTemp() {
        const value = parseFloat(hotBoxTempInput.value);
        hotBoxTempError.textContent = "";
        if (isNaN(value) || value < 25 || value > 30) {
          hotBoxTempError.textContent = "⚠ Hot Box Temp must be between 25°C and 35°C";
          hotBoxTempError.style.color = "red";
        }
      }
  
      // ✅ Air Pressure Validation (NEW)
  
      const airPressureError = document.getElementById("airPressureError");
  
      airPressureInput.addEventListener("blur", validateAirPressure);
      airPressureInput.addEventListener("input", validateAirPressure);
  
      function validateAirPressure() {
        const value = parseFloat(airPressureInput.value);
        airPressureError.textContent = "";
        if (isNaN(value) || value < 4.5 || value > 8.0) {
          airPressureError.textContent = "⚠ Air Pressure must be between 4.5 and 8.0 bar";
          airPressureError.style.color = "red";
        }
      }
  
      // ✅ Reusable function for range validation
      function setupValidation(fieldId, errorId, min, max, label) {
        const inputField = document.getElementById(fieldId);
        const errorSpan = document.getElementById(errorId);
  
        inputField.addEventListener("blur", validate);
        inputField.addEventListener("input", validate);
  
        function validate() {
          const value = parseFloat(inputField.value);
          errorSpan.textContent = ""; // clear previous error
  
          if (isNaN(value) || value < min || value > max) {
            errorSpan.textContent = `⚠ ${label} must be between ${min} and ${max}`;
            errorSpan.style.color = "red";
          }
        }
      }
     // app.js
  
  // Load all QC records on page load
  window.addEventListener('DOMContentLoaded', loadQcRecords);
  
  async function loadQcRecords() {
    try {
      const response = await fetch('http://localhost:3000/qc'); // Adjust if your endpoint is different
      const records = await response.json();
  
      const tableBody = document.getElementById('recordsTableBody');
      tableBody.innerHTML = '';
  
      records.forEach(record => {
        const row = document.createElement('tr');
  
        row.innerHTML = `
          <td>${new Date(record.hourly_time).toLocaleString()}</td>
          <td>${record.component_in_production || ''}</td>
          <td>${record.flow_rate_setting_a ?? ''} / ${record.flow_rate_display_b ?? ''}</td>
          <td>${record.hot_box_temp ?? ''} °C</td>
          <td>Air: ${record.air_pressure ?? ''}<br>Inject: ${record.inject_pressure ?? ''}</td>
          <td>${renderBoolean(record.feed_pipe_condition)}</td>
          <td>${record.powder_size || ''}</td>
          <td>${record.moisture ?? ''}</td>
          <td>${renderBoolean(record.is_new_bag)}</td>
          <td>${renderBoolean(record.air_drier_function)}</td>
          <td>${renderBoolean(record.filter_cleaning)}</td>
          <td>${renderBoolean(record.gauge_test)}</td>
        `;
  
        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error loading QC records:', err);
    }
  }
  
  function renderBoolean(value) {
    if (value === true) return '✔';
    if (value === false) return '✖';
    return '-';
  }
  
    loadQcRecords();
  
      // ✅ Call the function for each field
      setupValidation("hot-box-temp", "hotboxtemerror", 25, 30, "Hot Box Temp");
      setupValidation("air-pressure", "airPressureError", 4.5, 8.0, "Air Pressure");
      setupValidation("inject-pressure", "injectPressureError", 1, 2, "Inject Pressure");
  });