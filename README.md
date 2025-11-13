# Simulador de Micro Inversión

Este proyecto es un simulador interactivo que permite a los usuarios calcular la rentabilidad potencial de invertir en préstamos para PYMEs. Compara las ganancias contra un depósito a plazo fijo tradicional y genera un cronograma de pagos detallado que se puede exportar a PDF.

## 🚀 Demo en Vivo

*[Aquí irá el enlace a tu sitio desplegado en Netlify]*

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React, TypeScript
*   **Estilos:** Tailwind CSS
*   **Gráficos:** Chart.js
*   **Exportar a PDF:** jsPDF & jsPDF-AutoTable
*   **Selector de Fechas:** Flatpickr
*   **Entorno de Desarrollo:** AI Studio

---

## 🏁 Cómo Empezar (Ejecutar en tu Computadora)

Este proyecto está construido para ser muy simple de ejecutar localmente, ya que no requiere un paso de compilación ni un servidor de desarrollo.

1.  **Clona o descarga el repositorio:**
    Si tienes Git instalado, puedes clonarlo:
    ```bash
    git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
    cd TU_REPOSITORIO
    ```
    Si no, simplemente descarga el proyecto como un archivo ZIP desde GitHub y descomprímelo.

2.  **Abre el archivo `index.html`:**
    Navega a la carpeta del proyecto y haz doble clic en el archivo `index.html`. Se abrirá directamente en tu navegador web predeterminado (como Chrome, Firefox, etc.) y la aplicación funcionará completamente.

---

## 🚢 Despliegue (Publicar en Internet)

Este proyecto está diseñado para un despliegue fácil y automático usando GitHub y Netlify.

### Paso 1: Sube tu Código a GitHub

Si aún no lo has hecho, sigue estos pasos desde la terminal en la carpeta de tu proyecto para subir tu código a tu propio repositorio de GitHub.

1.  **Inicializa Git:**
    ```bash
    git init
    ```

2.  **Agrega todos los archivos:**
    ```bash
    git add .
    ```

3.  **Crea tu primer commit (guardado):**
    ```bash
    git commit -m "Versión inicial del simulador"
    ```
4.  **Renombra la rama principal a `main` (práctica estándar):**
    ```bash
    git branch -M main
    ```

5.  **Conecta con tu repositorio de GitHub** (reemplaza la URL con la tuya):
    ```bash
    git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
    ```

6.  **Sube el código:**
    ```bash
    git push -u origin main
    ```

### Paso 2: Despliega en Netlify

1.  **Regístrate en Netlify:** Usa tu cuenta de GitHub para registrarte en [netlify.com](https://www.netlify.com/).
2.  **Importa tu proyecto:**
    *   En tu panel de Netlify, haz clic en **"Add new site"** -> **"Import an existing project"**.
    *   Elige **GitHub** y selecciona el repositorio de tu simulador.
3.  **Configura los ajustes de despliegue (Build Settings):**
    *   **Build command (Comando de compilación):** Déjalo **EN BLANCO**.
    *   **Publish directory (Directorio de publicación):** Escribe `.` (un solo punto) o déjalo en blanco.
4.  **Haz clic en "Deploy site"**.

¡Listo! Netlify publicará tu sitio y te dará una URL. A partir de ahora, cada vez que hagas `git push` a tu repositorio, Netlify actualizará tu sitio web automáticamente.