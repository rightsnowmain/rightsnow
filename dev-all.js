const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🚀 Launching News Publishing & Digital Archive System');
console.log('🌐 Frontend: http://localhost:5173');
console.log('🔌 Backend:  http://localhost:3000/api/v1');
console.log('📖 Swagger:  http://localhost:3000/api/docs');
console.log('====================================================\n');

// Start backend
const backend = spawn('npm', ['run', 'start:dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true,
});

backend.on('error', (err) => console.error('[Backend Error]:', err));
frontend.on('error', (err) => console.error('[Frontend Error]:', err));

function cleanExit() {
  console.log('\n🛑 Stopping servers...');
  try { backend.kill(); } catch {}
  try { frontend.kill(); } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

