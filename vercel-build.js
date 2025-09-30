const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Vercel...');

try {
  // 1. Construir CSS
  console.log('📦 Construyendo CSS...');
  execSync('npm run build:css', { stdio: 'inherit' });
  
  // 2. Construir con Vite
  console.log('📦 Construyendo con Vite...');
  execSync('vite build --config vite.config.prod.js', { stdio: 'inherit' });
  
  // 3. Copiar archivos estáticos necesarios
  console.log('📁 Copiando archivos estáticos...');
  
  const distDir = path.join(__dirname, 'dist');
  
  // Crear directorio dist si no existe
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Función para copiar directorios recursivamente
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  // Función para copiar archivos individuales
  function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
  
  // Directorios a copiar
  const copyDirs = ['css', 'js', 'src'];
  
  // Archivos a copiar
  const copyFiles = ['favicon.svg', 'favicon.png'];
  
  // Copiar directorios
  copyDirs.forEach(dir => {
    const srcPath = path.join(__dirname, dir);
    const destPath = path.join(distDir, dir);
    
    if (fs.existsSync(srcPath)) {
      copyDir(srcPath, destPath);
      console.log(`✅ Copiado directorio: ${dir}`);
    } else {
      console.log(`⚠️  No encontrado directorio: ${dir}`);
    }
  });
  
  // Copiar archivos individuales
  copyFiles.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath);
      console.log(`✅ Copiado archivo: ${file}`);
    } else {
      console.log(`⚠️  No encontrado archivo: ${file}`);
    }
  });
  
  console.log('🎉 Build completado exitosamente');
  
} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
}
