const app = require('./app');
const { startReminderCron } = require('./reminderEngine');
const PORT = process.env.PORT || 5000;

// Start 12-hour confirmation & 1-day reminder engine timer
startReminderCron();

app.listen(PORT, () => {
  console.log(`LINE Recruitment API running on port ${PORT}`);
});
