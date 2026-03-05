import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ToolsService {
  private readonly logger = new Logger(ToolsService.name);

  // --- TOOL 1: TRM COLOMBIA ---
  async getTrmColombia(): Promise<string> {
    try {
      this.logger.log('Iniciando scraping de TRM...');
      const { data } = await axios.get('https://www.dolar-colombia.com/', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $ = cheerio.load(data);
      const valorRaw = $('.exchange-rate').first().text().trim();
      
      if (!valorRaw) throw new Error('No se encontró el selector');
      
      const valorLimpio = valorRaw.replace(/\s+/g, ' ');
      this.logger.log(`TRM obtenida: ${valorLimpio}`);
      return valorLimpio; 
    } catch (error) {
      this.logger.error(`Error en TRM: ${error.message}`);
      return "No disponible actualmente";
    }
  }
  
  // --- TOOL 2: NOTICIAS TECH REALES (Google News) ---
  async getTechNews(keyword: string): Promise<string> {
    try {
      const searchKeyword = keyword || 'tecnología';
      this.logger.log(`Buscando noticias reales sobre: ${searchKeyword}...`);
      
      // Consultamos el RSS de Google News (es público)
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(searchKeyword)}&hl=es-419&gl=CO&ceid=CO:es-419`;
      
      const { data } = await axios.get(url);
      const $ = cheerio.load(data, { xmlMode: true });
      
      const items = $('item').slice(0, 3); // Tomamos las 3 noticias más recientes
      
      if (items.length === 0) {
        return `No encontré noticias recientes sobre "${searchKeyword}".`;
      }

      let respuesta = `📰 *Últimas noticias sobre ${searchKeyword}:*\n\n`;

      items.each((i, el) => {
        const title = $(el).find('title').text();
        const link = $(el).find('link').text();
        const pubDate = $(el).find('pubDate').text().split(' ').slice(0, 4).join(' ');
        
        respuesta += `🔹 *${title}*\n📅 ${pubDate}\n🔗 ${link}\n\n`;
      });

      return respuesta;
      
    } catch (error) {
      this.logger.error(`Error en Noticias: ${error.message}`);
      return `Lo siento, no pude conectar con el servidor de noticias.`;
    }
  }
  // --- TOOL 3: INFO PÚBLICA ---
  async getPublicInfo(topic: string): Promise<string> {
    try {
      const searchTopic = topic || 'cultura';
      this.logger.log(`Buscando info estructurada de: ${searchTopic}...`);
      const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTopic)}`;
      
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'PockiBot/1.0' }
      });
      
      return data.extract || "No encontré un resumen sobre ese tema.";
    } catch (error) {
      this.logger.error(`Error en Info Pública: ${error.message}`);
      return "No encontré información oficial sobre ese tema.";
    }
  }

    // --- TOOL 4: PRECIO CRIPTO REAL ---
  async getCryptoPrice(coin: string): Promise<string> {
   try {
        const coinId = coin.toLowerCase().trim();
        this.logger.log(`Consultando precio real de: ${coinId}...`);
        
        // Usamos la API pública de CoinGecko
        const { data } = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,cop`
        );
        
        if (data[coinId]) {
          const usd = data[coinId].usd.toLocaleString();
          const cop = data[coinId].cop.toLocaleString();
          return `El precio actual de *${coinId.toUpperCase()}* es: \n💵 *${usd} USD*\n🇨🇴 *${cop} COP*`;
        }
        return `No encontré el precio de "${coin}". Intenta con 'bitcoin', 'ethereum' o 'solana'.`;
      } catch (error) {
        this.logger.error(`Error en Cripto: ${error.message}`);
        return "El servicio de precios cripto está temporalmente fuera de servicio.";
      }   
  }
}