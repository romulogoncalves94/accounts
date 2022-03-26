const chalk = require('chalk');
const inquirer = require("inquirer");
const fs = require('fs');
const { type } = require('os');

operation();

//Prompt de comando de ações no terminal.
function operation(){

    inquirer.prompt([{

        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]

    }]).then((answer) => {

        const action = answer['action'];

        if(action === 'Criar Conta'){
            createAccount();
        } else if(action === 'Depositar'){
            deposit();
        } else if(action === 'Consultar Saldo'){
            getAccountBalance();
        } else if(action === 'Sacar'){
            withdraw();
        } else if(action === 'Sair'){
            console.log(chalk.bgBlue.black('Obrigado por usar o accounts!'));
            process.exit();
        }

    }).catch(err => console.log(err));

}

//Mensagem ao selecionar a opção de criar uma nova conta.
function createAccount(){

    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco'));

    console.log(chalk.green('Defina as opções da sua conta a seguir'));

    buildAccount()

}

//Criação de conta.
function buildAccount(){

    inquirer.prompt([{

        name: 'accountName',
        message: 'Digite um nome para a sua conta:',

    }]).then(answer => {

        const accountName = answer['accountName'];
        console.info(accountName);

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts');
        }

        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'));
            buildAccount()
            return;
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', (err) => {
            console.log(err);
        });

        console.log(chalk.green('Parabéns, a sua conta foi criada com sucesso!'));

        operation();

    }).catch(err => console.log(err));

}

//Criação da Função de Depósito.
function deposit(){

    inquirer.prompt([{

        name: 'accountName',
        message: 'Qual o nome da sua conta?'

    }]).then((answer) => {

        const accountName = answer['accountName'];

        if(!checkAccount(accountName)){
            return deposit();
        }

        inquirer.prompt([{
            
            name: 'amount',
            message: 'Quanto você deseja depositar?'

        }]).then((answer) => {

            const amount = answer['amount'];

            addAmount(accountName, amount);
            operation();

        }).catch((err) => {
            console.log(err);
        })


    }).catch((err) => {
        console.log(err);
    })

}

//Criação de Função para verificar se a conta do usuário existe.
function checkAccount(accountName){

    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Essa conta não existe, escolha outro nome!'));
        return false;
    }

    return true;

}

//Criação de Função para adicionar saldo na conta.
function addAmount(accountName, amount){

    const accountData = getAccount(accountName);

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'));
        return deposit();
    }

    accountData.balance = parseFloat(amount) +  parseFloat(accountData.balance);

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => {
        console.log(err);
    });


    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`));

}

//Criação de Função para ler os arquivos JSON
function getAccount (accountName){

    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    });

    return JSON.parse(accountJSON);

}

//Criação de Função para Consultar o Saldo.
function getAccountBalance(){

    inquirer.prompt([{

        name: 'accountName',
        message: 'Qual o nome da sua conta?'

    }]).then((answer) => {

        const accountName = answer ['accountName'];

        if(!checkAccount(accountName)){
            return getAccountBalance();
        }

        const accountData = getAccount(accountName);

        console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é R$${accountData.balance}.`))

        operation();

    }).catch(err => console.log(err));

}

//Criação de Função para funcionalidade de saque.
function withdraw(){

    inquirer.prompt([{

        name: 'accountName',
        message: 'Qual o nome da sua conta?'

    }]).then((answer) => {

        const accountName = answer['accountName'];

        if(!checkAccount(accountName)){
            return withdraw();
        }

        inquirer.prompt([{

            name: 'amount',
            message: 'Quando você deseja sacar?'

        }]).then((answer) => {

            const amount = answer['amount'];

            removeAmount(accountName, amount);

        }).catch(err => console.log(err));

    }).catch(err => console.log(err));

}

function removeAmount(accountName, amount){

    const accountData = getAccount(accountName);

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'));
        return withdraw();
    }

    if(accountData.balance < amount){
        console.log(chalk.bgRed.black('Valor indisponível para saque!'));
        return withdraw();
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => {
        console.log(err);
    });

    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta.`));

    operation();

}