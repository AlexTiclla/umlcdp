const fs = require('fs');
const path = require('path');

// Configuración del build
const buildConfig = {
  // Directorios a copiar
  copyDirs: [
    'css',
    'js',
    'src'
  ],
  
  // Archivos a copiar
  copyFiles: [
    'favicon.svg',
    'favicon.png'
  ],
  
  // Directorio de salida
  distDir: 'dist'
};

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

// Función principal de build
function build() {
  console.log('🚀 Iniciando build para producción...');
  
  const distDir = path.join(__dirname, buildConfig.distDir);
  
  // Crear directorio dist si no existe
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Copiar directorios
  buildConfig.copyDirs.forEach(dir => {
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
  buildConfig.copyFiles.forEach(file => {
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
}

// Ejecutar build si se llama directamente
if (require.main === module) {
  build();
}

module.exports = { build, buildConfig };
