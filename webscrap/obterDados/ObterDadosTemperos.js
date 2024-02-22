const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs').promises; // Módulo fs para manipulação de arquivos assíncrona
const stringSimilarity = require('string-similarity')
const cors = require('cors'); // Adicionando o pacote COR
const app = express();

// Adicionando middleware CORS para todas as rotas
app.use(cors());



// Função para obter dados de legumes
const ObterDadosTemperos = async () => {
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: '/usr/bin/chromium-browser',
      extraPrefsArgs: ['--library-path=/path/to/libXdamage.so.1'],
      defaultTimeout: 10000,
    });

    const page = await browser.newPage();
  await page.goto('https://www.nagumo.com.br/sao-paulo-lj17-pires-do-rio-vila-progresso-avenida-pires-do-rio/produtos/feira/temperos-frescos');

  // Aguarda a navegação completa
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

  // Rola até o final da página
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  // Extrai a lista de preços e nomes usando o seletor específico
  const productList = await page.evaluate(() => {
    const products = [];
    const productElements = document.querySelectorAll('.list-product-item');

    productElements.forEach((element) => {
      const name = element.querySelector('div.list-product-item a h3').innerText;
      const price = element.querySelector('.area-bloco-preco').innerText;

      products.push({ name, price });
    });

    return products;
  });

  await browser.close();

  if (productList.length > 0) {
    // Define o caminho do arquivo
    const filePath = 'dadosRaspagem/raspagem_temperos.json';

    // Salva os dados em um arquivo JSON
    try {
      await fs.writeFile(filePath, JSON.stringify(productList, null, 2));
      console.log(`Dados salvos em ${filePath}`);
    } catch (error) {
      console.error('Erro ao salvar os dados em um arquivo JSON:', error);
    }

    return { products: productList, filePath };
  } else {
    throw new Error('Não foi possível encontrar produtos com o seletor fornecido.');
  }
};

module.exports = ObterDadosTemperos;
