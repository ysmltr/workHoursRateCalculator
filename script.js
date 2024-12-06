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
          const requiredColumns = ['workDate', 'duration', 'payout'];
          const headers = Object.keys(data[0]);
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
  });

  const earningsPerMinute = totalMinutes > 0 ? (totalEarnings / totalMinutes).toFixed(2) : 0;

  // Update the UI
  document.getElementById('start-date-display').textContent = startDate.toLocaleDateString();
  document.getElementById('end-date-display').textContent = endDate.toLocaleDateString();
  document.getElementById('total-hours').textContent = (totalMinutes / 60).toFixed(2);
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
