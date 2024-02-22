const express = require('express');
//const puppeteer = require('puppeteer');
const fs = require('fs').promises; // Módulo fs para manipulação de arquivos assíncrona
const stringSimilarity = require('string-similarity')
const cors = require('cors'); // Adicionando o pacote COR
const app = express();
const cron = require('node-cron');

const PORT = 8081;
const obterDadosLegumes = require('./obterDados/obterDadosLegumes.js');
const obterdadosfrutas = require('./obterDados/obterdadosfrutas.js');
const ObterDadosVerduras = require('./obterDados/ObterDadosVerduras.js');
const ObterDadosOvos = require('./obterDados/ObterDadosOvos.js');
const ObterDadosTemperos = require('./obterDados/ObterDadosTemperos.js');


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

    const nomeProdutoDigitado = req.params.nome;

    // Busca o produto diretamente pelo nome, sem conversão para minúsculas
    const produto = parsedData.find((p) => p.nome === nomeProdutoDigitado);

    if (!produto) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      // Pega o nome do produto
      const nomeProdutoMelhorCorrespondencia = produto.nome;

      // Envia as informações do produto
      res.json({
        nome: nomeProdutoMelhorCorrespondencia,
        // Inclua aqui outros atributos do produto, se necessário
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});


// Adiciona uma rota Legume para retornar informações com base no nome do produto categoria legume

app.get('/produto/legume/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('./dadosRaspagem/raspagem_legumes.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const nomeProdutoDigitado = req.params.nome.toLowerCase();

    // Encontra o produto correspondente
    const produto = parsedData.find((p) => p.name.toLowerCase() === nomeProdutoDigitado);

    if (!produto) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      res.json(produto);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});


  // Adiciona uma rota FRUTAS para retornar informações com base no nome do produto categoria frutas
app.get('/produto/frutas/:nome', async (req, res) => {
    try {
      const jsonData = await fs.readFile('./dadosRaspagem/raspage_frutas.json', 'utf-8');
      const parsedData = JSON.parse(jsonData);
  
      const nomeProdutoDigitado = req.params.nome.toLowerCase();
  
      // Utiliza a função de similaridade para encontrar as melhores correspondências
      const correspondencias = stringSimilarity.findBestMatch(nomeProdutoDigitado, parsedData.map(p => p.name.toLowerCase())).ratings;
      const melhoresCorrespondencias = correspondencias.filter(item => item.rating > 0.9); // Ajuste conforme necessário
  
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
  
  // Adiciona uma rota verduras para retornar informações com base no nome do produto categoria verduras

app.get('/produto/verduras/:nome', async (req, res) => {
  try {
    const jsonData = await fs.readFile('./dadosRaspagem/verduras.json', 'utf-8');
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
    const jsonData = await fs.readFile('./dadosRaspagem/raspagem_temperos.json', 'utf-8');
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
    const jsonData = await fs.readFile('./dadosRaspagem/raspagem_ovos.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const nomeProdutoDigitado = req.params.nome;

    // Busca o produto diretamente pelo nome, sem usar a função de similaridade
    const produto = parsedData.find((p) => p.name === nomeProdutoDigitado);

    if (!produto) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      // Pega o nome do produto
     // const nomeProdutoMelhorCorrespondencia = produto.name;
     const nomeProdutoMelhorCorrespondencia = produto
      // Envia as informações do produto
      res.json(nomeProdutoMelhorCorrespondencia);
      /* res.json({
        nome: nomeProdutoMelhorCorrespondencia,
        // Inclua aqui outros atributos do produto, se necessário
      }); */
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler o arquivo JSON.' });
  }
});

                                        //HORARIO PARA AS TAREFAS
// Defina a tarefa cron para ser executada a cada 4 horas exemplo cada 2min '*/2 * * * *'
cron.schedule('0 */4 * * *', async () => {
    try {
      const resultado = await obterDadosLegumes();
       const resultado3 = await ObterDadosOvos();
     /*  console.log(`Dados de legumes obtidos com sucesso legumes: ${resultado}`);
      console.log(`Dados de frutas obtidos com sucesso frutas: ${resultado2}`); */
    } catch (error) {
      console.error('Erro ao obter dados de produtos:', error);
    }
  });
  
  // Defina a tarefa cron para ser executada a cada 3 horas
  cron.schedule('0 */3 * * *', async () => {
      try {
        const resultado2 = await obterdadosfrutas();
        const resultado4 = await ObterDadosTemperos();
        const resultado5 = await ObterDadosVerduras();
       
        /* console.log(`Dados de ovos obtidos com sucesso ovos: ${resultado3}`);
        console.log(`Dados de temperos obtidos com sucesso temperos: ${resultado4}`);
        console.log(`Dados de temperos obtidos com sucesso verduras: ${resultado5}`); */
      } catch (error) {
        console.error('Erro ao obter dados de produtos:', error);
      }
    });
  console.log('Tarefa cron iniciada para obter dados de produto a cada 10 horas.');



// rota de chamada funcao raspagem LEGUMES Atualiza preço
/*  app.get('/legumes', async (req, res) => {
    try {
      const resultado = await obterDadosLegumes();
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
   */
app.get('/frutas', async (req, res) => {
    try {
      const dadosFrutas = await obterdadosfrutas();
      res.json({ products: dadosFrutas });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/verduras', async (req, res) => {
    try {
      const dadosVerduras = await ObterDadosVerduras();
      res.json({ products: dadosVerduras });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
 /*  app.get('/temperos', async (req, res) => {
    try {
      const dadosTemperos = await ObterDadosTemperos();
      res.json({ products: dadosTemperos });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get('/verduras', async (req, res) => {
    try {
      const dadosVerduras = await ObterDadosVerduras();
      res.json({ products: dadosVerduras });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/ovos', async (req, res) => {
    try {
      const dadosOvos = await ObterDadosOvos();
      res.json({ products: dadosOvos });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }); */


app.listen(PORT, () => {
    console.log('App listening on port 8081');
  });