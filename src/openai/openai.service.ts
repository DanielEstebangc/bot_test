import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ToolsService } from '../tools/tools.service';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor(
    private readonly toolsService: ToolsService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY') || 'ollama',
      baseURL: this.configService.get<string>('OPENAI_BASE_URL') || 'http://localhost:11434/v1',
    });
  }

  async chatConIA(mensajeUsuario: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-oss:20b',
        messages: [
          { 
            role: 'system', 
            content: `Eres "PockiBot", un asistente financiero carismático, analítico y experto en actualidad para WhatsApp. 📈🚀

            INSTRUCCIONES DE HERRAMIENTAS:
            1. DIVISAS: Si preguntan por TRM, dólar o divisas en Colombia, usa 'get_trm_colombia'.
            2. CRIPTO: Si preguntan por precios de Bitcoin, Ethereum o cualquier cripto, usa 'getCryptoPrice'.
            3. NOTICIAS: Si preguntan por lanzamientos (iPhone 16, GPT-5) o eventos de hoy, usa 'get_tech_news'.
            4. GENERAL: Para conceptos históricos o definiciones de Wikipedia, usa 'get_public_info'.

            REGLAS DE RAZONAMIENTO:
            - Si el usuario pide una comparación (ej: ¿Cuántos iPhones me compro con 1 Bitcoin?), DEBES usar las herramientas necesarias para obtener los valores reales y LUEGO realizar el cálculo matemático.
            - No te limites a dar el precio; ¡haz la cuenta final! 🧮
            - Si una herramienta falla, intenta con otra o explica por qué. Jamás digas "no sé" a la primera.

            FORMATO: 
            - Usa siempre *negritas* para resaltar valores numéricos y nombres importantes. 
            - Sé amable, usa emojis y mantén un tono profesional pero cercano (estilo "melo").` 
          },
          { role: 'user', content: mensajeUsuario }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'get_trm_colombia',
              description: 'OBTENER EL PRECIO DEL DÓLAR (TRM) EN COLOMBIA. Úsala solo para temas de dinero/divisas.',
            },
          },
          {
            type: 'function',
            function: {
              name: 'get_tech_news',
              description: 'BUSCAR NOTICIAS Y LANZAMIENTOS. Úsala para GPT-5, tecnología y eventos recientes.',
              parameters: {
                type: 'object',
                properties: {
                  keyword: { type: 'string', description: 'El tema de la noticia' }
                },
                required: ['keyword'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'get_public_info',
              description: 'BUSCAR INFORMACIÓN GENERAL O HISTÓRICA en Wikipedia.',
              parameters: {
                type: 'object',
                properties: {
                  topic: { type: 'string', description: 'El tema a buscar' }
                },
                required: ['topic'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'getCryptoPrice',
              description: 'Obtiene el precio actual de una criptomoneda en USD y COP.',
              parameters: {
                type: 'object',
                properties: {
                  coin: {
                    type: 'string',
                    description: 'El nombre de la criptomoneda (ej: bitcoin, ethereum, litecoin)',
                  },
                },
                required: ['coin'],
              },
            },
          },
        ],
      });

      const mensajeIA = response.choices[0].message;

      // --- PROCESAMIENTO DE LLAMADAS A HERRAMIENTAS ---
      if (mensajeIA.tool_calls && mensajeIA.tool_calls.length > 0) {
        for (const toolCall of mensajeIA.tool_calls) {
          
          // VALIDACIÓN DE TIPO PARA TYPESCRIPT
          if ('function' in toolCall) { 
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments || '{}');

            // CASO 1: TRM
            if (functionName === 'get_trm_colombia') {
              console.log('🤖 IA solicitó TRM...');
              const trmResultado = await this.toolsService.getTrmColombia();
              return `¡Claro! 📈 La *TRM actual* en Colombia es: *${trmResultado}*.`;
            }

            // CASO 2: NOTICIAS
            if (functionName === 'get_tech_news') {
              const keyword = args.keyword || args.query || args.topic || "tecnología"; 
              console.log(`🤖 IA solicitó noticias sobre: ${keyword}`);
              return await this.toolsService.getTechNews(keyword);
            }

            // CASO 3: INFO PÚBLICA
            if (functionName === 'get_public_info') {
              const topic = args.topic || args.query || args.keyword || "temas generales";
              console.log(`🤖 IA solicitó info sobre: ${topic}`);
              return await this.toolsService.getPublicInfo(topic);
            }

            // 4. CRIPTO (CORREGIDO)
            if (functionName === 'getCryptoPrice') {
              const coin = args.coin || "bitcoin";
              console.log(`🤖 IA solicitó precio de cripto: ${coin}`);
              return await this.toolsService.getCryptoPrice(coin);
            }
          }
        }
      }

      return mensajeIA.content || 'No pude generar una respuesta.';

    } catch (error) {
      console.error('❌ Error en OpenaiService:', error.message);
      return 'Lo siento, tuve un problema interno. ¿Podemos intentar de nuevo?';
    }
  }
}