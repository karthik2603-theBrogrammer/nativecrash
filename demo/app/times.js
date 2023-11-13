// Function to convert date to epoch time (in seconds)
function getEpochTime(date) {
    return Math.floor(date.getTime() / 1000);
  }
  
  // Get the current time
  const currentTime = new Date();
  
  // Store the epoch times in an array
  const epochTimes = [];
  
  // Generate 7 epoch times separated by 5 minutes
  for (let i = 0; i < 7; i++) {
    const epochTime = getEpochTime(currentTime);
    epochTimes.push(epochTime);
    currentTime.setMinutes(currentTime.getMinutes() + 5); // Increment time by 5 minutes
  }
  
  console.log(epochTimes);
  