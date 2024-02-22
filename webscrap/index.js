const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs').promises; // Módulo fs para manipulação de arquivos assíncrona
const stringSimilarity = require('string-similarity')
const cors = require('cors'); // Adicionando o pacote COR
const app = express();

// Adicionando middleware CORS para todas as rotas
app.use(cors());

//  Rota (EndPointe)para retornar informações com base no nome do produto
app.get('/produto/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('dados_produtos.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const nomeProdutoDigitado = req.params.nome.toLowerCase();

    // Utiliza a função de similaridade para encontrar as melhores correspondências
    const correspondencias = stringSimilarity.findBestMatch(nomeProdutoDigitado, parsedData.map(p => p.nome.toLowerCase())).ratings;
    const melhoresCorrespondencias = correspondencias.filter(item => item.rating > 0.8); // Ajuste conforme necessário

    if (melhoresCorrespondencias.length === 0) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      // Pega o nome do produto com a melhor correspondência
      const nomeProdutoMelhorCorrespondencia = melhoresCorrespondencias[0].target;
      
      // Encontra o produto correspondente
      const produto = parsedData.find((p) => p.nome.toLowerCase() === nomeProdutoMelhorCorrespondencia);

      res.json(produto);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});

//  Rota (EndPointe)para retornar informações com base no nome do OVOS
app.get('/api/ovos/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('ovos.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const nomeProdutoDigitado = req.params.nome.toLowerCase();

    // Utiliza a função de similaridade para encontrar as melhores correspondências
    const correspondencias = stringSimilarity.findBestMatch(nomeProdutoDigitado, parsedData.map(p => p.nome.toLowerCase())).ratings;
    const melhoresCorrespondencias = correspondencias.filter(item => item.rating > 0.5); // Ajuste conforme necessário

    if (melhoresCorrespondencias.length === 0) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      // Pega o nome do produto com a melhor correspondência
      const nomeProdutoMelhorCorrespondencia = melhoresCorrespondencias[0].target;
      
      // Encontra o produto correspondente
      const produto = parsedData.find((p) => p.nome.toLowerCase() === nomeProdutoMelhorCorrespondencia);

      res.json(produto);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});


/* app.get('/produto/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('dados_produtos.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);
    
    const nomeProduto = req.params.nome.toLowerCase();
    
    const produto = parsedData.find((p) => p.nome.toLowerCase() === nomeProduto);

    if (!produto) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      res.json(produto);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
}); */
// rota para atualizaçao preço produtos legumes
app.get('/legumes', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/chromium-browser',
    extraPrefsArgs: ['--library-path=/path/to/libXdamage.so.1'],
    defaultTimeout: 10000,
  });

  const page = await browser.newPage();
  await page.goto('https://www.nagumo.com.br/sao-paulo-lj17-pires-do-rio-vila-progresso-avenida-pires-do-rio/produtos/feira/legumes');

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

  if (productList.length > 0) {
    // Envia a lista de produtos como um objeto JSON
    res.json({ products: productList });

    // Define o caminho do arquivo
    const filePath = 'legumes_raspagem.json';
 
    // Salva os dados em um arquivo JSON
    try {
      await fs.writeFile(filePath, JSON.stringify(productList, null, 2));
      console.log(`Dados salvos em ${filePath}`);
    } catch (error) {
      console.error('Erro ao salvar os dados em um arquivo JSON:', error);
    }
  } else {
    res.status(500).json({ error: 'Não foi possível encontrar produtos com o seletor fornecido.' });
  }

  await browser.close();
});

// rota para atualizaçao preço produtos frutas
app.get('/frutas', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/chromium-browser',
    extraPrefsArgs: ['--library-path=/path/to/libXdamage.so.1'],
    defaultTimeout: 10000,
  });

  const page = await browser.newPage();
  await page.goto('https://www.nagumo.com.br/sao-paulo-lj17-pires-do-rio-vila-progresso-avenida-pires-do-rio/produtos/feira/frutas');

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

  if (productList.length > 0) {
    // Envia a lista de produtos como um objeto JSON
    res.json({ products: productList });

    // Define o caminho do arquivo
    const filePath = 'frutas_raspagem.json';
 
    // Salva os dados em um arquivo JSON
    try {
      await fs.writeFile(filePath, JSON.stringify(productList, null, 2));
      console.log(`Dados salvos em ${filePath}`);
    } catch (error) {
      console.error('Erro ao salvar os dados em um arquivo JSON:', error);
    }
  } else {
    res.status(500).json({ error: 'Não foi possível encontrar produtos com o seletor fornecido.' });
  }

  await browser.close();
});

// rota VERDURAS para atualizaçao preço produtos verduras
app.get('/verduras', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/chromium-browser',
    extraPrefsArgs: ['--library-path=/path/to/libXdamage.so.1'],
    defaultTimeout: 10000,
  });

  const page = await browser.newPage();
  await page.goto('https://www.nagumo.com.br/sao-paulo-lj17-pires-do-rio-vila-progresso-avenida-pires-do-rio/produtos/feira/verduras');

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

  if (productList.length > 0) {
    // Envia a lista de produtos como um objeto JSON
    res.json({ products: productList });

    // Define o caminho do arquivo
    const filePath = 'verduras_raspagem.json';
 
    // Salva os dados em um arquivo JSON
    try {
      await fs.writeFile(filePath, JSON.stringify(productList, null, 2));
      console.log(`Dados salvos em ${filePath}`);
    } catch (error) {
      console.error('Erro ao salvar os dados em um arquivo JSON:', error);
    }
  } else {
    res.status(500).json({ error: 'Não foi possível encontrar produtos com o seletor fornecido.' });
  }

  await browser.close();
});

// rota TEMPEROS para atualizaçao preço produtos temperos
app.get('/temperos', async (req, res) => {
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

  if (productList.length > 0) {
    // Envia a lista de produtos como um objeto JSON
    res.json({ products: productList });

    // Define o caminho do arquivo
    const filePath = 'temperos-frescos_raspagem.json';
 
    // Salva os dados em um arquivo JSON
    try {
      await fs.writeFile(filePath, JSON.stringify(productList, null, 2));
      console.log(`Dados salvos em ${filePath}`);
    } catch (error) {
      console.error('Erro ao salvar os dados em um arquivo JSON:', error);
    }
  } else {
    res.status(500).json({ error: 'Não foi possível encontrar produtos com o seletor fornecido.' });
  }

  await browser.close();
});


// rota OVOS para atualizaçao preço produtos ovos
app.get('/ovos', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/chromium-browser',
    extraPrefsArgs: ['--library-path=/path/to/libXdamage.so.1'],
    defaultTimeout: 10000,
  });

  const page = await browser.newPage();
  await page.goto('https://www.nagumo.com.br/sao-paulo-lj17-pires-do-rio-vila-progresso-avenida-pires-do-rio/produtos/alimentos-basicos/ovos');

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

  if (productList.length > 0) {
    // Envia a lista de produtos como um objeto JSON
    res.json({ products: productList });

    // Define o caminho do arquivo
    const filePath = 'ovos_raspagem.json';
 
    // Salva os dados em um arquivo JSON
    try {
      await fs.writeFile(filePath, JSON.stringify(productList, null, 2));
      console.log(`Dados salvos em ${filePath}`);
    } catch (error) {
      console.error('Erro ao salvar os dados em um arquivo JSON:', error);
    }
  } else {
    res.status(500).json({ error: 'Não foi possível encontrar produtos com o seletor fornecido.' });
  }

  await browser.close();
});


//----------------------------------------------------



// Adiciona uma rota Legume para retornar informações com base no nome do produto categoria legume

app.get('/produto/legume/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('legumes_raspagem.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const nomeProdutoDigitado = req.params.nome.toLowerCase();

    // Utiliza a função de similaridade para encontrar as melhores correspondências
    const correspondencias = stringSimilarity.findBestMatch(nomeProdutoDigitado, parsedData.map(p => p.name.toLowerCase())).ratings;
    const melhoresCorrespondencias = correspondencias.filter(item => item.rating > 0.5); // Ajuste conforme necessário

    if (melhoresCorrespondencias.length === 0) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      // Pega o nome do produto com a melhor correspondência
      const nomeProdutoMelhorCorrespondencia = melhoresCorrespondencias[0].target;
      
      // Encontra o produto correspondente
      const produto = parsedData.find((p) => p.name.toLowerCase() === nomeProdutoMelhorCorrespondencia);

      res.json(produto);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});

/* app.get('/produto/legume/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('legumes_raspagem.json', 'utf-8');
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
}); */

// Adiciona uma rota FRUTAS para retornar informações com base no nome do produto categoria frutas
app.get('/produto/frutas/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('frutas_raspagem.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const nomeProdutoDigitado = req.params.nome.toLowerCase();

    // Utiliza a função de similaridade para encontrar as melhores correspondências
    const correspondencias = stringSimilarity.findBestMatch(nomeProdutoDigitado, parsedData.map(p => p.name.toLowerCase())).ratings;
    const melhoresCorrespondencias = correspondencias.filter(item => item.rating > 0.5); // Ajuste conforme necessário

    if (melhoresCorrespondencias.length === 0) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      // Pega o nome do produto com a melhor correspondência
      const nomeProdutoMelhorCorrespondencia = melhoresCorrespondencias[0].target;
      
      // Encontra o produto correspondente
      const produto = parsedData.find((p) => p.name.toLowerCase() === nomeProdutoMelhorCorrespondencia);

      res.json(produto);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});

/* app.get('/produto/frutas/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('frutas_raspagem.json', 'utf-8');
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
 */

//-----------------------------------------------------

// Adiciona uma rota verduras para retornar informações com base no nome do produto categoria verduras

app.get('/produto/verduras/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('verduras_raspagem.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const nomeProdutoDigitado = req.params.nome.toLowerCase();

    // Utiliza a função de similaridade para encontrar as melhores correspondências
    const correspondencias = stringSimilarity.findBestMatch(nomeProdutoDigitado, parsedData.map(p => p.name.toLowerCase())).ratings;
    const melhoresCorrespondencias = correspondencias.filter(item => item.rating > 0.5); // Ajuste conforme necessário

    if (melhoresCorrespondencias.length === 0) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      // Pega o nome do produto com a melhor correspondência
      const nomeProdutoMelhorCorrespondencia = melhoresCorrespondencias[0].target;
      
      // Encontra o produto correspondente
      const produto = parsedData.find((p) => p.name.toLowerCase() === nomeProdutoMelhorCorrespondencia);

      res.json(produto);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});

// Adiciona uma rota temperos para retornar informações com base no nome do produto categoria temperos

app.get('/produto/temperos/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('temperos-frescos_raspagem.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const nomeProdutoDigitado = req.params.nome.toLowerCase();

    // Utiliza a função de similaridade para encontrar as melhores correspondências
    const correspondencias = stringSimilarity.findBestMatch(nomeProdutoDigitado, parsedData.map(p => p.name.toLowerCase())).ratings;
    const melhoresCorrespondencias = correspondencias.filter(item => item.rating > 0.5); // Ajuste conforme necessário

    if (melhoresCorrespondencias.length === 0) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      // Pega o nome do produto com a melhor correspondência
      const nomeProdutoMelhorCorrespondencia = melhoresCorrespondencias[0].target;
      
      // Encontra o produto correspondente
      const produto = parsedData.find((p) => p.name.toLowerCase() === nomeProdutoMelhorCorrespondencia);

      res.json(produto);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});

// Adiciona uma rota ovos para retornar informações com base no nome do produto categoria ovos

app.get('/produto/ovos/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('ovos_raspagem.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const nomeProdutoDigitado = req.params.nome.toLowerCase();

    // Utiliza a função de similaridade para encontrar as melhores correspondências
    const correspondencias = stringSimilarity.findBestMatch(nomeProdutoDigitado, parsedData.map(p => p.name.toLowerCase())).ratings;
    const melhoresCorrespondencias = correspondencias.filter(item => item.rating > 0.5); // Ajuste conforme necessário

    if (melhoresCorrespondencias.length === 0) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      // Pega o nome do produto com a melhor correspondência
      const nomeProdutoMelhorCorrespondencia = melhoresCorrespondencias[0].target;
      
      // Encontra o produto correspondente
      const produto = parsedData.find((p) => p.name.toLowerCase() === nomeProdutoMelhorCorrespondencia);

      res.json(produto);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});
app.listen(3000, () => {
  console.log('App listening on port 3000');
});
