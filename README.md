# PockiBot - WhatsApp AI Assistant 🚀

Asistente inteligente para WhatsApp desarrollado con **NestJS**, enfocado en soberanía de datos y escalabilidad mediante el uso de modelos de lenguaje locales.

## 🌟 Características Principales

- **IA Soberana:** Integración con **Ollama** para ejecutar modelos LLM locales (gpt-oss:20b), eliminando la dependencia de APIs pagas y garantizando la privacidad de la información.
- **Arquitectura de Agentes (Function Calling):** El sistema no solo procesa texto, sino que utiliza razonamiento lógico para decidir cuándo invocar herramientas externas para enriquecer sus respuestas.
- **Ecosistema de Tools:**
  - **Scraping Financiero:** Extracción en tiempo real de la TRM oficial en Colombia desde fuentes web.
  - **Búsqueda de Noticias:** Localización de actualidad tecnológica mediante keywords dinámicos.
  - **Información Estructurada:** Integración con APIs de conocimiento público (Wikipedia) para proveer datos precisos y verificables.
  - **Cripto-Intelligence:** Consulta de precios de criptomonedas en tiempo real (BTC, ETH, etc.) para análisis de mercado inmediato.
- **Persistencia y Contexto:** Historial de conversaciones almacenado en **PostgreSQL** con **TypeORM**, permitiendo la gestión de roles (`user`, `assistant`) para futuras implementaciones de memoria conversacional.
- **Arquitectura Limpia:** Diseño modular en NestJS siguiendo principios de **Solid** y **Clean Code**.

## 🛠️ Stack Tecnológico

- **Backend:** NestJS (Node.js) & TypeScript
- **IA Engine:** Ollama (Modelo local gpt-oss:20b)
- **Base de Datos:** PostgreSQL + TypeORM
- **Integración:** WhatsApp Cloud API (Meta)
- **Herramientas:** Axios (HTTP Client), Cheerio (Scraping), Wikipedia REST API

## 🤖 Lógica de Funcionamiento (Tool Discovery)

El flujo de decisión sigue un estándar de pensamiento de agente:
1. **Detección de Intención:** El LLM analiza si la consulta del usuario requiere datos externos (Ej: "¿Quién fue Alan Turing?" o "¿Cómo está el dólar?").
2. **Generación de Argumentos:** Si requiere una herramienta, la IA genera los parámetros necesarios (Ej: `{"topic": "Alan Turing"}`).
3. **Ejecución de Tool:** El `ToolsService` procesa la solicitud (Scraping o API Call).
4. **Síntesis de Respuesta:** La IA recibe los datos "crudos", los procesa y entrega al usuario una respuesta estructurada (tablas, listas o resúmenes).

## 🚀 Instalación y Uso

1. **Clonar el repo:** `git clone https://github.com/tu-usuario/pockibot.git`
2. **Instalar dependencias:** `npm install`
3. **Levantar Ollama:** `ollama run gpt-oss:20b` (Asegurarse de tener Ollama instalado).
4. **Configurar .env:**
    ```env
    WA_VERIFY_TOKEN=tu_token_seguro
    WA_ACCESS_TOKEN=tu_token_de_meta
    WA_PHONE_NUMBER_ID=tu_id_de_telefono
    OPENAI_BASE_URL=http://localhost:11434/v1
    OPENAI_MODEL=gpt-oss:20b
    DATABASE_URL=postgres://usuario:password@localhost:5432/pockibot_db
    ```
4. **Exponer Servidor Local (ngrok)**
   
Como la API de WhatsApp requiere una URL pública (HTTPS), debes usar el ejecutable incluido en la raíz:
 - Abre una terminal nueva en la raíz del proyecto.
 - Ejecuta: .\ngrok.exe http 3000
 - Copia la URL de Forwarding (ej. https://1234.ngrok-free.app).
 - Configura esta URL en el Dashboard de Meta Developers dentro de la configuración del Webhook, añadiendo el path: /whatsapp/webhook.
5. **Documentación de Endpoints (Postman)**
- Se ha incluido el archivo pockibot.postman_collection.json en la raíz del repositorio.
- Importancia: Permite simular mensajes de WhatsApp y verificar el Webhook sin necesidad de enviar mensajes reales por el celular.
- Uso: Importa el archivo en Postman y ajusta la variable hub.verify_token para las pruebas iniciales.

7. **Iniciar aplicación:** `npm run start:dev`
