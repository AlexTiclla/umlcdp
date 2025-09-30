const fs = require('fs');
const path = require('path');

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

// Crear directorio dist si no existe
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copiar archivos estáticos necesarios
const staticFiles = [
  'favicon.svg',
  'favicon.png',
  'index.html'
];

const staticDirs = [
  'css',
  'js',
  'src'
];

console.log('📁 Copiando archivos estáticos...');

// Copiar archivos individuales
staticFiles.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    copyFile(srcPath, destPath);
    console.log(`✅ Copiado: ${file}`);
  } else {
    console.log(`⚠️  No encontrado: ${file}`);
  }
});

// Copiar directorios
staticDirs.forEach(dir => {
  const srcPath = path.join(__dirname, dir);
  const destPath = path.join(distDir, dir);
  
  if (fs.existsSync(srcPath)) {
    copyDir(srcPath, destPath);
    console.log(`✅ Copiado directorio: ${dir}`);
  } else {
    console.log(`⚠️  No encontrado directorio: ${dir}`);
  }
});

console.log('🎉 Copia de archivos estáticos completada');
