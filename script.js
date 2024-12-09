document.getElementById('calculate').addEventListener('click', () => {
  const fileInput = document.getElementById('file');
  const errorMessage = document.getElementById('error-message');
  const startDate = new Date(document.getElementById('start-date').value);
  const endDate = new Date(document.getElementById('end-date').value);

  if (!fileInput.files.length) {
      showError('Please upload a CSV file!');
      return;
  }

  

  Papa.parse(fileInput.files[0], {
      header: true,
      complete: (results) => {
          const data = results.data;

          // Validate CSV structure
          const headers = Object.keys(data[0]).map(header => header.toLowerCase());
const requiredColumns = ['workdate', 'duration', 'payout'];
          const isValidFile = requiredColumns.every(col => headers.includes(col));

          if (!isValidFile) {
              showError('Invalid file format! Please upload your file as per the example CSV template.');
              return;
          }

          errorMessage.style.display = 'none'; // Hide error message if file is valid
          calculateMetrics(data, startDate, endDate);
      },
      error: () => {
          showError('An error occurred while processing the file. Please try again.');
      }
  });
});

function showError(message) {
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  setTimeout(() => errorMessage.style.display = 'none', 5000); 
}


function calculateMetrics(data, startDate, endDate) {
  let totalMinutes = 0;
  let totalEarnings = 0;

  data.forEach(row => {
    const workDate = new Date(row['workDate']);
    if (workDate >= startDate && workDate <= endDate) {
      const duration = parseDuration(row['duration']);
      const payout = parseFloat(row['payout'].replace('$', ''));
      totalMinutes += duration;
      totalEarnings += payout;
    }
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      showError('Please select valid start and end dates!');
      return;
  }
  });

  const earningsPerMinute = totalMinutes > 0 ? (totalEarnings / totalMinutes).toFixed(2) : '0.00';

  // Convert total minutes to hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  // Update the UI
  document.getElementById('start-date-display').textContent = startDate.toLocaleDateString();
  document.getElementById('end-date-display').textContent = endDate.toLocaleDateString();
  document.getElementById('total-hours').textContent = `${hours} hours and ${minutes} minutes`;
  document.getElementById('total-earnings').textContent = totalEarnings.toFixed(2);
  document.getElementById('earnings-per-minute').textContent = earningsPerMinute;
}


function parseDuration(duration) {
  let hours = 0, minutes = 0, seconds = 0;

  const hoursMatch = duration.match(/(\d+)h/);
  if (hoursMatch) hours = parseInt(hoursMatch[1]);

  const minutesMatch = duration.match(/(\d+)m/);
  if (minutesMatch) minutes = parseInt(minutesMatch[1]);

  const secondsMatch = duration.match(/(\d+)s/);
  if (secondsMatch) seconds = parseInt(secondsMatch[1]);

  return hours * 60 + minutes + seconds / 60;
}
