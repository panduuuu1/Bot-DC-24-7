module.exports = {
  apps: [{
    name: 'afk-bot',
    script: 'index.js',
    node_args: '--dns-result-order=ipv4first',
    max_memory_restart: '500M',
    autorestart: true,
    restart_delay: 10_000,
    max_restarts: 10,
    min_uptime: '60s'
  }],
};
