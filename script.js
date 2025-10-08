// scripts/app.js - Controle principal da aplicação

class CarConnectApp {
    constructor() {
        this.currentTab = 'database';
        this.currentForm = 'cliente';
        this.init();
    }

    init() {
        this.initializeTabs();
        this.initializeForms();
        this.loadDatabaseSchema();
        this.renderUseCaseDiagram();
        this.renderSequenceDiagram();
        this.renderStateDiagram();
    }

    // Controle das abas
    initializeTabs() {
        console.log('🚗 CarConnect App Inicializado');
    }

    initializeForms() {
        console.log('📝 Formulários inicializados');
    }

    // Carregar schema do banco
    loadDatabaseSchema() {
        const sqlCode = document.getElementById('sql-code');
        const dbTables = document.getElementById('db-tables');
        
        if (sqlCode) {
            sqlCode.textContent = CarConnectDatabase.getSQLSchema();
        }
        
        if (dbTables) {
            dbTables.innerHTML = CarConnectDatabase.renderDatabaseTables();
        }
    }
}

// Funções globais para controle de interface
function openTab(tabName) {
    // Esconder todas as abas
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(tab => tab.classList.remove('active'));
    
    // Remover active de todos os botões
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Mostrar aba selecionada
    document.getElementById(tabName).classList.add('active');
    
    // Ativar botão correspondente
    event.currentTarget.classList.add('active');
    
    // Atualizar diagramas se necessário
    if (tabName === 'usecase') {
        setTimeout(() => CarConnectDiagrams.renderUseCaseDiagram(), 100);
    } else if (tabName === 'sequence') {
        setTimeout(() => CarConnectDiagrams.renderSequenceDiagram(), 100);
    } else if (tabName === 'state') {
        setTimeout(() => CarConnectDiagrams.renderStateDiagram(), 100);
    }
}

function showForm(formType) {
    // Esconder todos os formulários
    const formWrappers = document.querySelectorAll('.form-wrapper');
    formWrappers.forEach(form => form.classList.remove('active'));
    
    // Remover active de todos os botões
    const formBtns = document.querySelectorAll('.form-type-btn');
    formBtns.forEach(btn => btn.classList.remove('active'));
    
    // Mostrar formulário selecionado
    document.getElementById(`${formType}-form`).classList.add('active');
    
    // Ativar botão correspondente
    event.currentTarget.classList.add('active');
}

// Funções de cadastro
function cadastrarCliente(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const dados = Object.fromEntries(formData);
    
    AuthSystem.cadastrarCliente(dados)
        .then(result => {
            alert('✅ Cliente cadastrado com sucesso!');
            event.target.reset();
        })
        .catch(error => {
            alert('❌ Erro ao cadastrar cliente: ' + error.message);
        });
}

function cadastrarVendedor(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const dados = Object.fromEntries(formData);
    
    AuthSystem.cadastrarVendedor(dados)
        .then(result => {
            alert('✅ Vendedor cadastrado com sucesso!');
            event.target.reset();
        })
        .catch(error => {
            alert('❌ Erro ao cadastrar vendedor: ' + error.message);
        });
}

function cadastrarVeiculo(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const dados = Object.fromEntries(formData);
    
    AuthSystem.cadastrarVeiculo(dados)
        .then(result => {
            alert('✅ Veículo cadastrado com sucesso!');
            event.target.reset();
        })
        .catch(error => {
            alert('❌ Erro ao cadastrar veículo: ' + error.message);
        });
}

// Inicialização da aplicação
function initializeApp() {
    window.app = new CarConnectApp();
}
// scripts/database.js - Schema e dados do banco

class CarConnectDatabase {
    static getSQLSchema() {
        return `-- BANCO DE DADOS CARCONNECT
CREATE DATABASE IF NOT EXISTS CarConnect;
USE CarConnect;

-- TABELA DE USUÁRIOS (BASE)
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo ENUM('cliente', 'vendedor') NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_login DATETIME,
    ativo BOOLEAN DEFAULT TRUE
);

-- TABELA DE CLIENTES
CREATE TABLE clientes (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    telefone VARCHAR(20),
    data_nascimento DATE,
    endereco TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- TABELA DE VENDEDORES
CREATE TABLE vendedores (
    id_vendedor INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    telefone VARCHAR(20),
    data_nascimento DATE,
    endereco TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- TABELA DE VEÍCULOS
CREATE TABLE veiculos (
    id_veiculo INT PRIMARY KEY AUTO_INCREMENT,
    id_vendedor INT NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    ano_fabricacao INT NOT NULL,
    ano_modelo INT NOT NULL,
    cor VARCHAR(30) NOT NULL,
    combustivel ENUM('gasolina', 'diesel', 'flex', 'eletrico', 'hibrido', 'outro') NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    vendido BOOLEAN DEFAULT FALSE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vendedor) REFERENCES vendedores(id_vendedor)
);

-- TABELA DE VENDAS/COMPRAS
CREATE TABLE vendas (
    id_venda INT PRIMARY KEY AUTO_INCREMENT,
    id_veiculo INT NOT NULL,
    id_cliente INT NOT NULL,
    id_vendedor INT NOT NULL,
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'aprovada', 'cancelada', 'concluida') DEFAULT 'pendente',
    FOREIGN KEY (id_veiculo) REFERENCES veiculos(id_veiculo),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_vendedor) REFERENCES vendedores(id_vendedor)
);

-- TABELA DE RECUPERAÇÃO DE SENHA
CREATE TABLE recuperacao_senha (
    id_recuperacao INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    data_expiracao DATETIME NOT NULL,
    utilizado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);`;
    }

    static renderDatabaseTables() {
        const tables = [
            {
                name: 'usuarios',
                color: '#3498db',
                fields: [
                    'id_usuario (PK)',
                    'email (UNIQUE)',
                    'senha_hash',
                    'tipo (cliente/vendedor)',
                    'data_cadastro',
                    'ultimo_login',
                    'ativo'
                ]
            },
            {
                name: 'clientes',
                color: '#2ecc71',
                fields: [
                    'id_cliente (PK)',
                    'id_usuario (FK)',
                    'nome',
                    'sobrenome',
                    'cpf (UNIQUE)',
                    'rg',
                    'telefone',
                    'data_nascimento',
                    'endereco'
                ]
            },
            {
                name: 'vendedores',
                color: '#e74c3c',
                fields: [
                    'id_vendedor (PK)',
                    'id_usuario (FK)',
                    'nome',
                    'sobrenome',
                    'cpf (UNIQUE)',
                    'rg',
                    'telefone',
                    'data_nascimento',
                    'endereco'
                ]
            },
            {
                name: 'veiculos',
                color: '#f39c12',
                fields: [
                    'id_veiculo (PK)',
                    'id_vendedor (FK)',
                    'marca',
                    'modelo',
                    'ano_fabricacao',
                    'ano_modelo',
                    'cor',
                    'combustivel',
                    'preco',
                    'vendido',
                    'data_cadastro'
                ]
            },
            {
                name: 'vendas',
                color: '#9b59b6',
                fields: [
                    'id_venda (PK)',
                    'id_veiculo (FK)',
                    'id_cliente (FK)',
                    'id_vendedor (FK)',
                    'data_venda',
                    'valor',
                    'status'
                ]
            }
        ];

        return tables.map(table => `
            <div class="table-card" style="border-left: 5px solid ${table.color}">
                <h3 style="color: ${table.color}">${table.name}</h3>
                <ul>
                    ${table.fields.map(field => `<li>${field}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    static getTableRelationships() {
        return [
            { from: 'usuarios', to: 'clientes', type: '1:1' },
            { from: 'usuarios', to: 'vendedores', type: '1:1' },
            { from: 'vendedores', to: 'veiculos', type: '1:N' },
            { from: 'clientes', to: 'vendas', type: '1:N' },
            { from: 'veiculos', to: 'vendas', type: '1:1' },
            { from: 'vendedores', to: 'vendas', type: '1:N' }
        ];
    }
}

// Adicionar CSS para as tabelas
const tableStyles = `
<style>
.table-card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.table-card h3 {
    margin-bottom: 15px;
    font-size: 1.2em;
    border-bottom: 2px solid #ecf0f1;
    padding-bottom: 8px;
}

.table-card ul {
    list-style: none;
    padding: 0;
}

.table-card li {
    padding: 5px 0;
    border-bottom: 1px solid #ecf0f1;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
}

.table-card li:last-child {
    border-bottom: none;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', tableStyles);
// scripts/diagrams.js - Renderização dos diagramas

class CarConnectDiagrams {
    static renderUseCaseDiagram() {
        const container = document.getElementById('use-case-diagram');
        if (!container) return;

        const diagramData = DiagramData.useCaseDiagram;
        
        container.innerHTML = `
            <div class="diagram-title">Sistema CarConnect - Casos de Uso</div>
            ${this.generateUseCaseDiagram(diagramData)}
        `;
    }

    static generateUseCaseDiagram(data) {
        let html = '';
        
        // Atores
        data.actors.forEach(actor => {
            html += `
                <div class="actor" style="left: ${actor.x}px; top: ${actor.y}px;">
                    <strong>${actor.name}</strong>
                    <div>${actor.type}</div>
                </div>
            `;
        });

        // Casos de Uso
        data.useCases.forEach(useCase => {
            html += `
                <div class="use-case" style="left: ${useCase.x}px; top: ${useCase.y}px;">
                    ${useCase.name}
                </div>
            `;
        });

        // Relacionamentos
        data.relationships.forEach(rel => {
            html += `
                <div class="relationship-line" 
                     style="left: ${rel.fromX}px; top: ${rel.fromY}px; width: ${rel.width}px; transform: rotate(${rel.angle}deg);">
                </div>
            `;
        });

        return html;
    }

    static renderSequenceDiagram() {
        const container = document.getElementById('sequence-diagram');
        if (!container) return;

        const diagramData = DiagramData.sequenceDiagram;
        
        container.innerHTML = `
            <div class="diagram-title">Processo de Compra - Diagrama de Sequência</div>
            ${this.generateSequenceDiagram(diagramData)}
        `;
    }

    static generateSequenceDiagram(data) {
        let html = '';
        
        // Lifelines
        data.lifelines.forEach(lifeline => {
            html += `
                <div class="lifeline" style="left: ${lifeline.x}px;"></div>
                <div class="lifeline-label" style="left: ${lifeline.x}px;">
                    ${lifeline.name}
                </div>
            `;
        });

        // Messages
        data.messages.forEach((message, index) => {
            const delay = index * 80;
            html += `
                <div class="message" 
                     style="left: ${message.x}px; top: ${message.y}px; animation-delay: ${delay}ms;">
                    ${message.text}
                </div>
                <div class="message-arrow"
                     style="left: ${message.arrowX}px; top: ${message.arrowY}px;
                            border-width: 5px 0 5px 8px;
                            border-color: transparent transparent transparent #9b59b6;">
                </div>
            `;
        });

        return html;
    }

    static renderStateDiagram() {
        const container = document.getElementById('state-diagram');
        if (!container) return;

        const diagramData = DiagramData.stateDiagram;
        
        container.innerHTML = `
            <div class="diagram-title">Estados do Sistema - Diagrama de Estados</div>
            ${this.generateStateDiagram(diagramData)}
        `;
    }

    static generateStateDiagram(data) {
        let html = '';
        
        // Estados
        data.states.forEach(state => {
            html += `
                <div class="state-node" style="left: ${state.x}px; top: ${state.y}px;">
                    <strong>${state.name}</strong>
                    ${state.description ? `<div>${state.description}</div>` : ''}
                </div>
            `;
        });

        // Transições
        data.transitions.forEach(transition => {
            html += `
                <div class="state-transition" 
                     style="left: ${transition.fromX}px; top: ${transition.fromY}px; 
                            width: ${transition.width}px; transform: rotate(${transition.angle}deg);">
                </div>
                <div class="transition-label" 
                     style="left: ${transition.labelX}px; top: ${transition.labelY}px;">
                    ${transition.label}
                </div>
            `;
        });

        return html;
    }
}

// Adicionar animações CSS para os diagramas
const diagramAnimations = `
<style>
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
}

.diagram-title {
    text-align: center;
    font-size: 1.2em;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 30px;
    padding-bottom: 10px;
    border-bottom: 2px solid #ecf0f1;
}

.actor, .use-case, .state-node {
    animation: pulse 2s infinite;
}

.message {
    animation: slideIn 0.5s ease-out;
}

.relationship-line, .state-transition {
    animation: drawLine 1s ease-out;
}

@keyframes drawLine {
    from { width: 0; }
    to { width: var(--final-width); }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', diagramAnimations);
// assets/diagram-data.js - Dados para os diagramas

const DiagramData = {
    // Diagrama de Casos de Uso
    useCaseDiagram: {
        actors: [
            { name: "Cliente", type: "Actor", x: 50, y: 100 },
            { name: "Vendedor", type: "Actor", x: 50, y: 300 },
            { name: "Sistema", type: "Actor", x: 650, y: 200 }
        ],
        useCases: [
            { name: "Buscar Veículos", x: 200, y: 50 },
            { name: "Favoritar Veículo", x: 200, y: 120 },
            { name: "Comprar Veículo", x: 200, y: 190 },
            { name: "Gerenciar Perfil", x: 200, y: 260 },
            { name: "Cadastrar Veículo", x: 500, y: 100 },
            { name: "Gerenciar Veículos", x: 500, y: 170 },
            { name: "Visualizar Vendas", x: 500, y: 240 },
            { name: "Autenticar Usuário", x: 350, y: 350 },
            { name: "Recuperar Senha", x: 350, y: 420 },
            { name: "Validar Dados", x: 350, y: 490 }
        ],
        relationships: [
            { fromX: 120, fromY: 120, width: 80, angle: 0 },
            { fromX: 120, fromY: 150, width: 80, angle: 0 },
            { fromX: 120, fromY: 180, width: 80, angle: 0 },
            { fromX: 120, fromY: 210, width: 80, angle: 0 },
            { fromX: 170, fromY: 320, width: 180, angle: -45 },
            { fromX: 170, fromY: 390, width: 180, angle: -45 },
            { fromX: 170, fromY: 460, width: 180, angle: -45 }
        ]
    },

    // Diagrama de Sequência
    sequenceDiagram: {
        lifelines: [
            { name: "Cliente", x: 100 },
            { name: "Sistema", x: 300 },
            { name: "Vendedor", x: 500 },
            { name: "Banco de Dados", x: 700 }
        ],
        messages: [
            { text: "1. Login", x: 150, y: 80, arrowX: 200, arrowY: 85 },
            { text: "2. Validar Credenciais", x: 250, y: 120, arrowX: 300, arrowY: 125 },
            { text: "3. Query Usuário", x: 450, y: 160, arrowX: 500, arrowY: 165 },
            { text: "4. Dados Válidos", x: 350, y: 200, arrowX: 400, arrowY: 205 },
            { text: "5. Acesso Concedido", x: 150, y: 240, arrowX: 200, arrowY: 245 },
            { text: "6. Buscar Carros", x: 150, y: 280, arrowX: 200, arrowY: 285 },
            { text: "7. Query Veículos", x: 450, y: 320, arrowX: 500, arrowY: 325 },
            { text: "8. Lista de Carros", x: 350, y: 360, arrowX: 400, arrowY: 365 },
            { text: "9. Selecionar Carro", x: 150, y: 400, arrowX: 200, arrowY: 405 },
            { text: "10. Detalhes Veículo", x: 350, y: 440, arrowX: 400, arrowY: 445 },
            { text: "11. Iniciar Compra", x: 150, y: 480, arrowX: 200, arrowY: 485 },
            { text: "12. Processar Venda", x: 450, y: 520, arrowX: 500, arrowY: 525 },
            { text: "13. Venda Registrada", x: 350, y: 560, arrowX: 400, arrowY: 565 },
            { text: "14. Confirmação", x: 150, y: 600, arrowX: 200, arrowY: 605 }
        ]
    },

    // Diagrama de Estados
    stateDiagram: {
        states: [
            { 
                name: "Não Registrado", 
                description: "Usuário não cadastrado",
                x: 100, 
                y: 100 
            },
            { 
                name: "Registrado", 
                description: "Cadastro incompleto",
                x: 300, 
                y: 100 
            },
            { 
                name: "Ativo", 
                description: "Usuário ativo no sistema",
                x: 500, 
                y: 100 
            },
            { 
                name: "Inativo", 
                description: "Conta desativada",
                x: 100, 
                y: 300 
            },
            { 
                name: "Veículo Disponível", 
                description: "Pronto para venda",
                x: 400, 
                y: 250 
            },
            { 
                name: "Veículo Vendido", 
                description: "Transação concluída",
                x: 600, 
                y: 250 
            },
            { 
                name: "Venda Pendente", 
                description: "Aguardando confirmação",
                x: 300, 
                y: 400 
            },
            { 
                name: "Venda Concluída", 
                description: "Transação finalizada",
                x: 500, 
                y: 400 
            }
        ],
        transitions: [
            { 
                fromX: 180, fromY: 120, width: 120, angle: 0,
                label: "Cadastro", labelX: 230, labelY: 110
            },
            { 
                fromX: 380, fromY: 120, width: 120, angle: 0,
                label: "Ativação", labelX: 430, labelY: 110
            },
            { 
                fromX: 520, fromY: 130, width: 150, angle: -135,
                label: "Desativar", labelX: 470, labelY: 200
            },
            { 
                fromX: 150, fromY: 320, width: 150, angle: 45,
                label: "Reativar", labelX: 200, labelY: 250
            },
            { 
                fromX: 420, fromY: 170, width: 100, angle: 90,
                label: "Cadastrar", labelX: 440, labelY: 220
            },
            { 
                fromX: 470, fromY: 280, width: 130, angle: 0,
                label: "Vender", labelX: 520, labelY: 270
            },
            { 
                fromX: 350, fromY: 420, width: 150, angle: 0,
                label: "Confirmar", labelX: 400, labelY: 410
            }
        ]
    }
};

// Adicionar estilos específicos para os diagramas
const diagramStyles = `
<style>
.use-case-diagram {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    min-height: 600px;
    position: relative;
}

.sequence-diagram {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    min-height: 700px;
    position: relative;
}

.state-diagram {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    min-height: 500px;
    position: relative;
}

.actor {
    background: linear-gradient(135deg, #3498db, #2980b9);
    border: 2px solid #2980b9;
    font-weight: bold;
}

.use-case {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    border: 2px solid #27ae60;
    font-weight: bold;
}

.lifeline {
    background: linear-gradient(to bottom, #e74c3c, #c0392b);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.lifeline-label {
    background: linear-gradient(135deg, #34495e, #2c3e50);
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.message {
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
    border: 2px solid #8e44ad;
    font-weight: bold;
    box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}

.state-node {
    background: linear-gradient(135deg, #f39c12, #e67e22);
    border: 2px solid #e67e22;
    font-weight: bold;
    box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}

.relationship-line, .state-transition {
    background: linear-gradient(to right, #7f8c8d, #95a5a6);
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.transition-label {
    background: white;
    border: 1px solid #bdc3c7;
    font-size: 11px;
    font-weight: bold;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', diagramStyles);
