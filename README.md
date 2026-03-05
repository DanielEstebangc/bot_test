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

## 🏛️ Arquitectura y Decisiones Técnicas

El proyecto sigue una arquitectura Modular y Orientada a Servicios, aprovechando las bondades de NestJS para garantizar la escalabilidad y mantenibilidad.
1. **Desacoplamiento de Herramientas (Tool Pattern)**
Se implementó un ToolsService centralizado. En lugar de saturar el servicio de IA con lógica de negocio, la IA actúa únicamente como un Orquestador. Ella detecta la intención y delega la ejecución al servicio correspondiente (Scraping, API Cripto, etc.). Esto permite añadir nuevas funcionalidades sin tocar la lógica del LLM.

2. **Manejo Asíncrono de Webhooks**
Una decisión técnica crítica fue responder con un estado 200 OK a Meta de forma inmediata. Dado que el procesamiento de modelos LLM y el Scraping pueden tomar varios segundos, procesar la respuesta de forma asíncrona evita que Meta reintente el envío del mensaje (timeout de 5s), previniendo bucles infinitos de respuestas.

3. **Persistencia con TypeORM**
Se eligió PostgreSQL para almacenar el historial de mensajes. La decisión de usar una DB relacional permite estructurar los metadatos de los mensajes (ID de WhatsApp, Timestamp, Roles) de forma robusta, facilitando futuras implementaciones de memoria de largo plazo (RAG) o analíticas de uso.

4. **Estrategia de Scraping vs API**
Para la TRM, se optó por scraping sobre fuentes oficiales para garantizar el dato exacto del mercado colombiano. Para Criptomonedas, se priorizó el uso de APIs estructuradas para obtener precisión en milésimas de segundo debido a la volatilidad de los activos.

## 🤖 Lógica de Funcionamiento (Tool Discovery)

El flujo de decisión sigue un estándar de pensamiento de agente:
1. **Detección de Intención:** El LLM analiza si la consulta del usuario requiere datos externos (Ej: "¿Quién fue Alan Turing?" o "¿Cómo está el dólar?").
2. **Generación de Argumentos:** Si requiere una herramienta, la IA genera los parámetros necesarios (Ej: `{"topic": "Alan Turing"}`).
3. **Ejecución de Tool:** El `ToolsService` procesa la solicitud (Scraping o API Call).
4. **Síntesis de Respuesta:** La IA recibe los datos "crudos", los procesa y entrega al usuario una respuesta estructurada (tablas, listas o resúmenes).

## 🧪 Pruebas y Documentación de Endpoints

Para facilitar el testing sin depender de la API de Meta, se incluye el archivo `pockibot.postman_collection.json` en la raíz del repositorio.

### **Uso del Simulador:**
* **Payload Real:** El request *'Simular Mensaje Real'* contiene la estructura exacta que envía WhatsApp Cloud API (incluyendo metadatos y perfil de usuario).
* **Escenario de Noticia:** El payload está configurado para preguntar: *“¿Quién ganó el premio de tecnología ayer?”*, lo que permite probar el flujo completo: **Webhook -> IA -> Tool (Noticias) -> Respuesta**.

| Método | Endpoint | Función |
| :--- | :--- | :--- |
| **GET** | `/whatsapp/webhook` | Verificación de `hub.verify_token` (Handshake con Meta). |
| **POST** | `/whatsapp/webhook` | Recepción de mensajes y procesamiento de Agentes. |
## 🚀 Instalación y Uso

1. **Clonar el repo:** `git clone https://github.com/tu-usuario/pockibot.git`
2. **Instalar dependencias:** `npm install`
3. **Levantar Ollama:** `ollama run gpt-oss:20b` (Asegurarse de tener Ollama instalado).
4. **Configurar .env:**
   ```env
   # Meta / WhatsApp
   WA_VERIFY_TOKEN=pockibot_secreto_2026
   WA_ACCESS_TOKEN=tu_access_token_aqui
   WA_PHONE_NUMBER_ID=1054703254387280
   WA_BUSINESS_ACCOUNT_ID=1645582889945416

   # OpenAI / Ollama
   OPENAI_API_KEY=ollama 
   OPENAI_BASE_URL=http://localhost:11434/v1
   OPENAI_MODEL=gpt-oss:20b

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=tu_password
   DB_NAME=pocki_db
5. **Exponer Servidor Local (ngrok)**
   
  Como la API de WhatsApp requiere una URL pública (HTTPS), debes usar el ejecutable incluido en la raíz:
 - Abre una terminal nueva en la raíz del proyecto.
 - Ejecuta: .\ngrok.exe http 3000
 - Copia la URL de Forwarding (ej. https://1234.ngrok-free.app).
 - Configura esta URL en el Dashboard de Meta Developers dentro de la configuración del Webhook, añadiendo el path: /whatsapp/webhook.
6. **Documentación de Endpoints (Postman)**
- Se ha incluido el archivo pockibot.postman_collection.json en la raíz del repositorio.
- Importancia: Permite simular mensajes de WhatsApp y verificar el Webhook sin necesidad de enviar mensajes reales por el celular.
- Uso: Importa el archivo en Postman y ajusta la variable hub.verify_token para las pruebas iniciales.

7. **Iniciar aplicación:** `npm run start:dev`
