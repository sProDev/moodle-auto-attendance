# Moodle Auto Attendance

Automatically attendance for Moodle - Learning Management System

## Getting Started

### Requirements

1. [NodeJS v14.15.x (and npm)](https://nodejs.org/en/)
2. [Cron](https://cron-job.org/en/)

### Installation

1. Clone this repository
   
   ```bash
   git clone https://github.com/sProDev/moodle-auto-attendance.git
   cd moodle-auto-attendance
   ```

2. Install the dependencies
   
   ```bash
   npm i --save
   ```

3. Copy the `example.env` file to `.env`
4. Customize your `.env` file

## Usage

Use crontab to run command periodically

- Crontab every day (at 07.30)
  
  ```
  30 7 * * * node /path/index.js
  ```

- Crontab every day except Saturday & Sunday (at 07.30)
  
  ```
  30 7 * * 1,2,3,4,5 node /path/index.js
  ```

Manual command

```bash
node /path/index.js
```

## Troubleshooting

Make sure all the necessary dependencies are installed: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

## Additional Information

### Background of the Problem

I made this automatic attendance because myself sometimes forgot about attendance in every subject, and it happened that my school used Moodle to do teaching and learning activities online.

This project is also inspired by [@zFz0000](https://github.com/zFz0000/MoodleAutoAttendance) with the same project but the language used is Python.

### License

[MIT](https://github.com/sProDev/moodle-auto-attendance/blob/main/LICENSE)
