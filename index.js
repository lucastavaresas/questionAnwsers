// configurando o express
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const connection = require('./database/database');
const Pergunta = require('./database/Pergunta');
const Resposta =  require('./database/Resposta');
//db
connection
    .authenticate()
    .then(()=>{
        console.log('Conexão feita');
    })
    .catch((msgErro)=>{
        console.log(msgErro);
    })

//usando ejs como nossa view engine
app.set('view engine','ejs');
//configurando a pasta public como nossos arquivos estaticos (css,imagem,etc...)
app.use(express.static('public'));
//configurando o body parser para o express
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
//rotas
app.get('/',(req,res) => {
    Pergunta.findAll({raw : true, order: [
        ['id','DESC']
    ]}).then(perguntas => {
        console.log(perguntas);
        res.render('index',{
            perguntas: perguntas
        });
    });
});

app.get('/perguntar',(req,res) => {
    res.render('perguntar');
});

app.post('/treat',(req,res)=>{
    const titulo = req.body.titulo;
    const descricao = req.body.descricao;
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(() => {
        res.redirect("/");
    });
});

app.get("/pergunta/:id", (req,res) =>{
    const id = req.params.id;
    Pergunta.findOne({
        where: {
            id:id
        }
    }).then(pergunta => {
        if(pergunta != undefined){
            Resposta.findAll({
                where: {
                    perguntaId: pergunta.id,
                    order: [['id','DESC']]
                }
            }).then(respostas =>{
                res.render('pergunta',{
                    pergunta: pergunta,
                    respostas: respostas
                })
            });
        }else{
            res.redirect('/');
        }
    });
})

app.post('/responder',(req,res) => {
    const corpo = req.body.corpo;
    const perguntaId = req.body.pergunta;
    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(() => {
            res.redirect(`/pergunta/${perguntaId}`)
        } 
    );
});

app.listen(4000,(err) => {
    if(err){
        console.log('an error has been detected');
    }
    console.log('It´s all fine, go on');
});