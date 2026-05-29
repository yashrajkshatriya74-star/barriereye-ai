# 🚨 BarrierEye AI

**Detecta barreras de accesibilidad en calles y banquetas usando Inteligencia Artificial.**

> *Identifica cada obstáculo en segundos, para que ciudadanos y autoridades puedan actuar de inmediato.*

---

## 🎯 ¿Qué es BarrierEye AI?

BarrierEye AI es una plataforma web que permite a cualquier ciudadano fotografiar calles, banquetas, cruces y rampas de Tijuana para detectar automáticamente barreras de accesibilidad usando visión artificial (GPT-4o Vision).

Tijuana no fue diseñada pensando en todos. Personas con discapacidad motriz, adultos mayores y familias enfrentan banquetas dañadas, transporte inaccesible y trayectos imposibles. **BarrierEye AI** es la herramienta ciudadana para cambiar eso.

---

## ✨ Funcionalidades

- 📸 **Subir o arrastrar imágenes** de calles y banquetas
- 🤖 **Análisis automático con GPT-4o Vision** — detecta obstáculos en segundos
- ⚠️ **Nivel de peligro** — BAJO / MEDIO / ALTO con código de colores
- 📍 **Ubicación GPS** — geolocalización exacta del reporte
- 🗺️ **Mapa en vivo** — visualiza todas las barreras reportadas en el mapa
- 📊 **Estadísticas** — dashboard con conteo de barreras por nivel
- 📋 **Historial** — guarda todos los escaneos anteriores (localStorage)
- 📤 **Compartir reporte** — comparte con un clic
- 📧 **Reportar a autoridades** — envía email directamente a las autoridades

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|-----------|-----|
| Next.js 15 | Framework web |
| TypeScript | Lenguaje principal |
| OpenAI GPT-4o Vision | Análisis de imágenes con IA |
| Tailwind CSS | Diseño y estilos |
| Leaflet.js | Mapa interactivo |
| React Hooks | Estado y lógica |
| localStorage | Persistencia de historial |

---

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/yashrajkshatriya74-star/barriereye-ai.git
cd barriereye-ai

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Agregar tu OPENAI_API_KEY en .env.local

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ⚙️ Variables de entorno

```env
OPENAI_API_KEY=tu_api_key_de_openai
```

---

## 📱 Cómo usar

1. **Obtén tu ubicación** — haz clic en "Obtener mi ubicación"
2. **Sube una foto** — arrastra o selecciona una imagen de calle/banqueta
3. **Espera el análisis** — la IA detecta barreras en segundos
4. **Ve el resultado** — nivel de peligro, barreras detectadas y recomendaciones
5. **Reporta** — comparte o envía email a las autoridades

---

## 🏆 Hackathon

Proyecto desarrollado para **HackFox 2026** — Track: *Tijuana sin Barreras*

Organizado por GDG Tijuana en Pixeland Arcade, Tijuana, México.

---

## 💙 Impacto Social

Más de **1 de cada 5 personas** en México tiene alguna discapacidad. Las calles de Tijuana presentan múltiples barreras que hacen imposible el desplazamiento para estas personas. BarrierEye AI democratiza el reporte ciudadano y ayuda a construir una ciudad más accesible para todos.

---

*BarrierEye AI — porque cada calle debería ser accesible para todos.*
