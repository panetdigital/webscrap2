const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/:product', async (req, res) => {
  const { product } = req.params;

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/chromium-browser',
    extraPrefsArgs: ['--library-path=/path/to/libXdamage.so.1'],
    devtools: true,
    defaultTimeout: 10000,
  });

  const page = await browser.newPage();
  await page.goto(`https://www.nagumo.com.br/sao-paulo-lj17-pires-do-rio-vila-progresso-avenida-pires-do-rio/produto/${product}/`);

  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

  await page.waitForSelector('.bloco-preco.preco-detalhe-produto.ng-star-inserted');

  const productInfo = await page.evaluate(() => {
    const name = document.querySelector('.ng-star-inserted h1').innerText; // Substitua 'seletor-do-nome' pelo seletor real do nome
    const price = document.querySelector('.bloco-preco.preco-detalhe-produto.ng-star-inserted').innerText; // Substitua 'seletor-do-preco' pelo seletor real do preço

    return { name, price };
  });

  if (productInfo.name && productInfo.price) {
    res.json({ product: productInfo });

    const filePath = 'dados_raspagem.json';

    try {
      await fs.writeFile(filePath, JSON.stringify(productInfo, null, 2));
      console.log(`Dados salvos em ${filePath}`);
    } catch (error) {
      console.error('Erro ao salvar os dados em um arquivo JSON:', error);
    }
  } else {
    res.status(500).json({ error: 'Não foi possível encontrar informações para o produto fornecido.' });
  }


  await browser.close();
});

app.get('/produto/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('dados_raspagem.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const nomeProduto = req.params.nome.toLowerCase();

    const produto = parsedData.find((p) => p.name.toLowerCase() === nomeProduto);

    if (!produto) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      res.json(produto);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});


app.listen(3000, () => {
  console.log('App listening on port 3000');
});
