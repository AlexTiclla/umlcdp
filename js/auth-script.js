// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
  initializeAuth();
}

// Utilidades para validación
const ValidationUtils = {
    email: (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },
  
    password: (password) => {
      const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      }
  
      const score = Object.values(checks).filter(Boolean).length
  
      return {
        score,
        strength: score < 2 ? "weak" : score < 3 ? "fair" : score < 4 ? "good" : "strong",
        checks,
      }
    },
  }

function initializeAuth() {
  // Verificar que todas las dependencias estén disponibles
  if (!window.apiClient) {
    console.error('API Client no está disponible');
    return;
  }
  
  if (!window.authManager) {
    console.error('AuthManager no está disponible');
    return;
  }
  
  console.log('Inicializando autenticación...');
  
  // Manejo del formulario de login
  if (document.getElementById("loginForm")) {
    const loginForm = document.getElementById("loginForm")
  
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()
  
      const formData = new FormData(loginForm)
      const email = formData.get("email")
      const password = formData.get("password")
      const remember = formData.get("remember")
  
      // Validación básica
      if (!ValidationUtils.email(email)) {
        showError("Por favor ingresa un correo electrónico válido")
        return
      }
  
      if (password.length < 6) {
        showError("La contraseña debe tener al menos 6 caracteres")
        return
      }
  
      // Mostrar loading
      showLoading(true)
  
      try {
        // Simular llamada a API
        await simulateAPICall()
  
        // Usar AuthManager para login
        const result = await window.authManager.login(email, password, remember)
        
        if (result.success) {
          showSuccess(`¡Bienvenido, ${result.user.first_name}!`)
          
          // Redirigir a la gestión de proyectos
          setTimeout(() => {
            window.location.href = "projects.html"
          }, 1500)
        }
      } catch (error) {
        console.error("Error de login:", error)
        showError(error.message || "Error al iniciar sesión")
      } finally {
        showLoading(false)
      }
    })
  }
  
  // Manejo del formulario de registro
  if (document.getElementById("signupForm")) {
    const signupForm = document.getElementById("signupForm")
    const passwordInput = document.getElementById("password")
    const confirmPasswordInput = document.getElementById("confirmPassword")
    const passwordStrength = document.getElementById("passwordStrength")
  
    // Validación de contraseña en tiempo real
    passwordInput.addEventListener("input", (e) => {
      const password = e.target.value
      const validation = ValidationUtils.password(password)
  
      // Actualizar barra de fuerza
      passwordStrength.className = `password-strength strength-${validation.strength}`
  
      const strengthText = passwordStrength.querySelector(".strength-text")
      const messages = {
        weak: "Contraseña débil",
        fair: "Contraseña regular",
        good: "Contraseña buena",
        strong: "Contraseña fuerte",
      }
  
      strengthText.textContent = password ? messages[validation.strength] : "Ingresa una contraseña"
    })
  
    // Validación de confirmación de contraseña
    confirmPasswordInput.addEventListener("input", (e) => {
      const password = passwordInput.value
      const confirmPassword = e.target.value
  
      if (confirmPassword && password !== confirmPassword) {
        e.target.setCustomValidity("Las contraseñas no coinciden")
      } else {
        e.target.setCustomValidity("")
      }
    })
  
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault()
  
      const formData = new FormData(signupForm)
      const userData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        company: formData.get("company"),
        terms: formData.get("terms"),
        newsletter: formData.get("newsletter"),
      }
  
      // Validaciones
      if (!userData.firstName.trim() || !userData.lastName.trim()) {
        showError("Por favor completa tu nombre y apellido")
        return
      }
  
      if (!ValidationUtils.email(userData.email)) {
        showError("Por favor ingresa un correo electrónico válido")
        return
      }
  
      const passwordValidation = ValidationUtils.password(userData.password)
      if (passwordValidation.score < 2) {
        showError("La contraseña es muy débil. Debe tener al menos 8 caracteres, mayúsculas, minúsculas y números")
        return
      }
  
      if (userData.password !== userData.confirmPassword) {
        showError("Las contraseñas no coinciden")
        return
      }
  
      if (!userData.terms) {
        showError("Debes aceptar los términos y condiciones")
        return
      }
  
      // Mostrar loading
      showLoading(true)
  
      try {
        // Simular llamada a API
        await simulateAPICall()
  
        // Usar AuthManager para registro
        const result = await window.authManager.register(userData)
        
        if (result.success) {
          showSuccess(result.message)
          setTimeout(() => {
            window.location.href = "login.html"
          }, 2000)
        }
      } catch (error) {
        console.error("Error de registro:", error)
        showError(error.message || "Error al crear la cuenta")
      } finally {
        showLoading(false)
      }
    })
  }
  
  // Manejo de botones sociales
  document.querySelectorAll(".auth-button.social").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault()
      const provider = button.classList.contains("google") ? "google" : "github"
  
      // Aquí implementarías la autenticación social
      console.log(`Iniciar sesión con ${provider}`)
  
      // Ejemplo de redirección para OAuth
      // window.location.href = `/api/auth/${provider}`;
    })
  })
  
  // Funciones de utilidad para UI
  function showLoading(show) {
    const buttons = document.querySelectorAll(".auth-button.primary")
    buttons.forEach((button) => {
      const text = button.querySelector(".button-text")
      const spinner = button.querySelector(".loading-spinner")
  
      if (show) {
        text.style.opacity = "0"
        spinner.style.display = "block"
        button.disabled = true
      } else {
        text.style.opacity = "1"
        spinner.style.display = "none"
        button.disabled = false
      }
    })
  }
  
  function showError(message) {
    // Remover notificaciones existentes
    removeNotifications()
  
    const notification = createNotification(message, "error")
    document.body.appendChild(notification)
  
    setTimeout(() => {
      notification.remove()
    }, 5000)
  }
  
  function showSuccess(message) {
    // Remover notificaciones existentes
    removeNotifications()
  
    const notification = createNotification(message, "success")
    document.body.appendChild(notification)
  
    setTimeout(() => {
      notification.remove()
    }, 5000)
  }
  
  function createNotification(message, type) {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 1000;
          max-width: 400px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease;
          background: ${type === "error" ? "#ef4444" : "#10b981"};
      `
  
    notification.textContent = message
  
    // Agregar estilos de animación
    if (!document.getElementById("notification-styles")) {
      const styles = document.createElement("style")
      styles.id = "notification-styles"
      styles.textContent = `
              @keyframes slideIn {
                  from {
                      transform: translateX(100%);
                      opacity: 0;
                  }
                  to {
                      transform: translateX(0);
                      opacity: 1;
                  }
              }
          `
      document.head.appendChild(styles)
    }
  
    return notification
  }
  
  function removeNotifications() {
    document.querySelectorAll(".notification").forEach((n) => n.remove())
  }
  
  // Simular llamada a API para demo
  function simulateAPICall() {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500)
    })
  }
  
  // Inicialización
  document.addEventListener("DOMContentLoaded", () => {
    // Verificar si el usuario ya está autenticado
    if (window.authManager && window.authManager.isAuthenticated()) {
    // Si ya está autenticado, redirigir a proyectos
    if (window.location.pathname.includes("login") || window.location.pathname.includes("signup")) {
      window.location.href = "projects.html"
    }
    }
  
    // Auto-completar email si se recordó al usuario
    const rememberUser = localStorage.getItem("rememberUser")
    const savedEmail = localStorage.getItem("savedEmail")
    if (rememberUser && savedEmail) {
      const emailInput = document.getElementById("email")
      if (emailInput) {
        emailInput.value = savedEmail
      }
    }
  })
}

// Inicialización global
document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el usuario ya está autenticado
  if (window.authManager && window.authManager.isAuthenticated()) {
    // Si ya está autenticado, redirigir a proyectos
    if (window.location.pathname.includes("login") || window.location.pathname.includes("signup")) {
      window.location.href = "projects.html"
    }
  }

  // Auto-completar email si se recordó al usuario
  const rememberUser = localStorage.getItem("rememberUser")
  const savedEmail = localStorage.getItem("savedEmail")
  if (rememberUser && savedEmail) {
    const emailInput = document.getElementById("email")
    if (emailInput) {
      emailInput.value = savedEmail
    }
  }
})
  