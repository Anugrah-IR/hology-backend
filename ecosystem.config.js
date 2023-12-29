module.exports = {
  apps: [
    {
      name: 'hology-api',
      script: './build/index.js',
      watch: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      autorestart: true,
      exec_mode: 'cluster',
      instances: '3',
    },
  ],
};
