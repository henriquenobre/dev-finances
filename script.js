//Abrir e fechar modal, adcionando e remocendo uma classe
const Modal ={
    open(){
        document.querySelector('.modal-overlay').classList.add('active')    
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}  

//salvar no localStorage do navegador
const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions",
        JSON.stringify(transactions))
    }
}

//calcula as entradas e saidas e adciona e remove transações
const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        let income = 0
        Transaction.all.forEach((transaction) => {
            if(transaction.amount > 0){
                income += transaction.amount
            }
        } )
        return income
    },
    expenses(){
        let expense = 0
        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0){
                expense += transaction.amount
            }
        } )
        return expense
    },
    total(){
        return Transaction.incomes() + Transaction.expenses()
    }
}

// Objeto com a tabela com as transações de entrda e saida no html
const DOM = {
    //busca o id da tabela para adcionar o filho tr
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction)
        tr.dataset.index = index
        DOM.transactionContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
         //verifica se o valor é positivo ou negativo e adciona a classe
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        //joga o valor da transação la do objeto para a função que altera o formato a Utils
        const amount = Utils.formatCurrency(transaction.amount)
        
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt=""></td>
        ` 
        return html
    },

    //função que atualiza o balanço
    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    //função para limpar a tabela de entradas e saidas
    clearTransactions(){
        DOM.transactionContainer.innerHTML = ""
    }

}

//transformar formato do valor para moeda brasileira
const Utils = {
    formatAmaount(value){
        value = Number(value.replace(/\,\./g, "")) *100
        return value
    },

    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g,"")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        }) 

        return signal + value
    }
}

// grava informaçlões do formulario e faz o submit
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateField(){
        const {description, amount, date} = Form.getValues()
    
        if(
           description.trim() === "" || 
           amount.trim() === ""||
           date.trim() === ""){
               throw new Error("Por favor, preencha todos os campos")
           }
    },

    formatData(){
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmaount(amount)

        date = Utils.formatDate(date)

        return {description, amount, date}
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()

        try {
            Form.validateField()
            const transaction = Form.formatData()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()

        } catch (error) {
            alert(error.message)
        }

        
    }
}



//iniciar aplicação
const App = {
    init(){
        // Adciona o objeto transação na tabela do HTML
        Transaction.all.forEach(DOM.addTransaction)

        //Chama a função que atualiza o balanço
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload(){
        DOM.clearTransactions()
        App.init()
    }
}
App.init()



