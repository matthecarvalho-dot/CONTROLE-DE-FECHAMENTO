// Dados iniciais de exemplo
let fechamentos = [
    {
        id: 1,
        data: '2024-01-15',
        vendedora: 'Ana Silva',
        horario: '14:30',
        cliente: 'João Santos',
        marca: 'TechPro',
        status: 'Pago e Assinado',
        valor: 1500.00
    },
    {
        id: 2,
        data: '2024-01-15',
        vendedora: 'Maria Oliveira',
        horario: '10:15',
        cliente: 'Pedro Costa',
        marca: 'InnovaBrand',
        status: 'Apenas Assinado',
        valor: 2300.00
    },
    {
        id: 3,
        data: '2024-02-20',
        vendedora: 'Ana Silva',
        horario: '16:45',
        cliente: 'Carla Souza',
        marca: 'MarketPlus',
        status: 'Pago e Assinado',
        valor: 1800.00
    }
];

let proximoId = 4;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    atualizarDashboard();
    atualizarTabelaFechamentos();
    atualizarPastasMensais();
    popularFiltros();
});

// Carregar dados do localStorage
function carregarDados() {
    const dadosSalvos = localStorage.getItem('fechamentos');
    if (dadosSalvos) {
        fechamentos = JSON.parse(dadosSalvos);
        if (fechamentos.length > 0) {
            proximoId = Math.max(...fechamentos.map(f => f.id)) + 1;
        }
    }
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('fechamentos', JSON.stringify(fechamentos));
}

// Navegação entre páginas
function showPage(pageName) {
    // Remover classe active de todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remover classe active de todos os itens do menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Adicionar classe active na página selecionada
    document.getElementById(`${pageName}-page`).classList.add('active');
    
    // Ativar o item do menu correspondente
    event.target.closest('.menu-item').classList.add('active');
    
    // Atualizar conteúdo conforme a página
    if (pageName === 'dashboard') {
        atualizarDashboard();
    } else if (pageName === 'planilha') {
        atualizarTabelaFechamentos();
        popularFiltros();
    } else if (pageName === 'historico') {
        atualizarPastasMensais();
    }
}

// Modal
function abrirModalNovoFechamento() {
    document.getElementById('modal-fechamento').classList.add('active');
    document.getElementById('form-fechamento').reset();
    document.getElementById('input-data').value = new Date().toISOString().split('T')[0];
}

function fecharModal() {
    document.getElementById('modal-fechamento').classList.remove('active');
}

// Salvar Fechamento
function salvarFechamento(event) {
    event.preventDefault();
    
    const novoFechamento = {
        id: proximoId++,
        data: document.getElementById('input-data').value,
        vendedora: document.getElementById('input-vendedora').value,
        horario: document.getElementById('input-horario').value,
        cliente: document.getElementById('input-cliente').value,
        marca: document.getElementById('input-marca').value,
        status: document.getElementById('input-status').value,
        valor: parseFloat(document.getElementById('input-valor').value)
    };
    
    fechamentos.push(novoFechamento);
    salvarDados();
    fecharModal();
    atualizarTabelaFechamentos();
    atualizarDashboard();
    popularFiltros();
}

// Editar Fechamento
function editarFechamento(id) {
    const fechamento = fechamentos.find(f => f.id === id);
    if (!fechamento) return;
    
    document.getElementById('input-data').value = fechamento.data;
    document.getElementById('input-vendedora').value = fechamento.vendedora;
    document.getElementById('input-horario').value = fechamento.horario;
    document.getElementById('input-cliente').value = fechamento.cliente;
    document.getElementById('input-marca').value = fechamento.marca;
    document.getElementById('input-status').value = fechamento.status;
    document.getElementById('input-valor').value = fechamento.valor;
    
    document.getElementById('modal-fechamento').classList.add('active');
    
    // Modificar o comportamento do formulário para edição
    const form = document.getElementById('form-fechamento');
    form.onsubmit = function(event) {
        event.preventDefault();
        
        fechamento.data = document.getElementById('input-data').value;
        fechamento.vendedora = document.getElementById('input-vendedora').value;
        fechamento.horario = document.getElementById('input-horario').value;
        fechamento.cliente = document.getElementById('input-cliente').value;
        fechamento.marca = document.getElementById('input-marca').value;
        fechamento.status = document.getElementById('input-status').value;
        fechamento.valor = parseFloat(document.getElementById('input-valor').value);
        
        salvarDados();
        fecharModal();
        atualizarTabelaFechamentos();
        atualizarDashboard();
        
        // Restaurar comportamento original
        form.onsubmit = salvarFechamento;
    };
}

// Excluir Fechamento
function excluirFechamento(id) {
    if (confirm('Tem certeza que deseja excluir este fechamento?')) {
        fechamentos = fechamentos.filter(f => f.id !== id);
        salvarDados();
        atualizarTabelaFechamentos();
        atualizarDashboard();
        popularFiltros();
    }
}

// Filtrar Fechamentos
function filtrarFechamentos() {
    const mesFiltro = document.getElementById('filtro-mes').value;
    const vendedoraFiltro = document.getElementById('filtro-vendedora').value;
    const busca = document.getElementById('filtro-busca').value.toLowerCase();
    
    let fechamentosFiltrados = fechamentos;
    
    if (mesFiltro) {
        fechamentosFiltrados = fechamentosFiltrados.filter(f => f.data.startsWith(mesFiltro));
    }
    
    if (vendedoraFiltro) {
        fechamentosFiltrados = fechamentosFiltrados.filter(f => f.vendedora === vendedoraFiltro);
    }
    
    if (busca) {
        fechamentosFiltrados = fechamentosFiltrados.filter(f => 
            f.vendedora.toLowerCase().includes(busca) ||
            f.cliente.toLowerCase().includes(busca) ||
            f.marca.toLowerCase().includes(busca)
        );
    }
    
    renderizarTabela(fechamentosFiltrados);
}

// Atualizar Tabela
function atualizarTabelaFechamentos() {
    renderizarTabela(fechamentos);
}

function renderizarTabela(fechamentosArray) {
    const tbody = document.getElementById('tbody-fechamentos');
    
    if (fechamentosArray.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    Nenhum fechamento encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = fechamentosArray.map(f => `
        <tr>
            <td>${formatarData(f.data)}</td>
            <td>${f.vendedora}</td>
            <td>${f.horario}</td>
            <td>${f.cliente}</td>
            <td>${f.marca}</td>
            <td>
                <span class="status-badge ${f.status === 'Pago e Assinado' ? 'status-pago' : 'status-assinado'}">
                    ${f.status}
                </span>
            </td>
            <td>R$ ${f.valor.toFixed(2)}</td>
            <td>
                <button class="btn-edit" onclick="editarFechamento(${f.id})">✏️</button>
                <button class="btn-delete" onclick="excluirFechamento(${f.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Atualizar Dashboard
function atualizarDashboard() {
    const mesSelecionado = document.getElementById('mes-dashboard').value;
    let dadosFiltrados = fechamentos;
    
    if (mesSelecionado) {
        dadosFiltrados = fechamentos.filter(f => f.data.startsWith(mesSelecionado));
    }
    
    // Estatísticas
    const totalFechamentos = dadosFiltrados.length;
    const pagosAssinados = dadosFiltrados.filter(f => f.status === 'Pago e Assinado').length;
    const apenasAssinados = dadosFiltrados.filter(f => f.status === 'Apenas Assinado').length;
    
    // Melhor vendedora
    const vendedoras = {};
    dadosFiltrados.forEach(f => {
        if (!vendedoras[f.vendedora]) {
            vendedoras[f.vendedora] = { quantidade: 0, valor: 0 };
        }
        vendedoras[f.vendedora].quantidade++;
        vendedoras[f.vendedora].valor += f.valor;
    });
    
    let melhorVendedora = { nome: '-', quantidade: 0 };
    for (let [nome, dados] of Object.entries(vendedoras)) {
        if (dados.quantidade > melhorVendedora.quantidade) {
            melhorVendedora = { nome, quantidade: dados.quantidade };
        }
    }
    
    // Atualizar cards
    document.getElementById('total-fechamentos').textContent = totalFechamentos;
    document.getElementById('pagos-assinados').textContent = pagosAssinados;
    document.getElementById('apenas-assinados').textContent = apenasAssinados;
    document.getElementById('melhor-vendedora').textContent = melhorVendedora.nome;
    
    // Atualizar gráficos
    atualizarGraficoVendedoras(vendedoras);
    atualizarGraficoHorarios(dadosFiltrados);
}

function atualizarGraficoVendedoras(vendedoras) {
    const chart = document.getElementById('vendedoras-chart');
    
    if (Object.keys(vendedoras).length === 0) {
        chart.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Sem dados disponíveis</p>';
        return;
    }
    
    const maxQuantidade = Math.max(...Object.values(vendedoras).map(v => v.quantidade));
    
    chart.innerHTML = Object.entries(vendedoras)
        .sort((a, b) => b[1].quantidade - a[1].quantidade)
        .map(([nome, dados]) => `
            <div class="bar-chart-item">
                <div class="bar-label">
                    <span>${nome}</span>
                    <span>${dados.quantidade} vendas - R$ ${dados.valor.toFixed(2)}</span>
                </div>
                <div class="bar-background">
                    <div class="bar-fill" style="width: ${(dados.quantidade / maxQuantidade) * 100}%">
                        ${dados.quantidade}
                    </div>
                </div>
            </div>
        `).join('');
}

function atualizarGraficoHorarios(fechamentos) {
    const chart = document.getElementById('horario-chart');
    
    if (fechamentos.length === 0) {
        chart.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Sem dados disponíveis</p>';
        return;
    }
    
    const horarios = {
        'Manhã': 0,
        'Tarde': 0,
        'Noite': 0
    };
    
    fechamentos.forEach(f => {
        const hora = parseInt(f.horario.split(':')[0]);
        if (hora < 12) horarios['Manhã']++;
        else if (hora < 18) horarios['Tarde']++;
        else horarios['Noite']++;
    });
    
    const total = fechamentos.length;
    
    chart.innerHTML = Object.entries(horarios)
        .filter(([_, quantidade]) => quantidade > 0)
        .map(([periodo, quantidade]) => `
            <div class="bar-chart-item">
                <div class="bar-label">
                    <span>${periodo}</span>
                    <span>${quantidade} vendas (${((quantidade / total) * 100).toFixed(1)}%)</span>
                </div>
                <div class="bar-background">
                    <div class="bar-fill" style="width: ${(quantidade / total) * 100}%">
                        ${quantidade}
                    </div>
                </div>
            </div>
        `).join('');
}

// Pastas Mensais
function atualizarPastasMensais() {
    const pastasContainer = document.getElementById('pastas-mensais');
    
    // Agrupar por mês
    const meses = {};
    fechamentos.forEach(f => {
        const chave = f.data.substring(0, 7); // YYYY-MM
        if (!meses[chave]) {
            meses[chave] = [];
        }
        meses[chave].push(f);
    });
    
    if (Object.keys(meses).length === 0) {
        pastasContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">Nenhum mês disponível</p>';
        return;
    }
    
    pastasContainer.innerHTML = Object.entries(meses)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([mes, fechamentosMes]) => {
            const [ano, mesNum] = mes.split('-');
            const nomeMes = obterNomeMes(parseInt(mesNum));
            const totalVendas = fechamentosMes.length;
            const valorTotal = fechamentosMes.reduce((sum, f) => sum + f.valor, 0);
            
            return `
                <div class="pasta-card" onclick="abrirPastaMes('${mes}')">
                    <div class="pasta-icon">📁</div>
                    <div class="pasta-nome">${nomeMes} ${ano}</div>
                    <div class="pasta-info">
                        <p>${totalVendas} fechamentos</p>
                        <p>R$ ${valorTotal.toFixed(2)}</p>
                    </div>
                </div>
            `;
        }).join('');
}

function abrirPastaMes(mes) {
    const [ano, mesNum] = mes.split('-');
    const nomeMes = obterNomeMes(parseInt(mesNum));
    
    // Filtrar fechamentos do mês
    const fechamentosMes = fechamentos.filter(f => f.data.startsWith(mes));
    
    // Exibir em um modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📁 ${nomeMes} ${ano}</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="dashboard-grid" style="margin-bottom: 20px;">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-icon">📊</span>
                        <h3>Total de Fechamentos</h3>
                    </div>
                    <p class="stat-number">${fechamentosMes.length}</p>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-icon">💰</span>
                        <h3>Valor Total</h3>
                    </div>
                    <p class="stat-number">R$ ${fechamentosMes.reduce((sum, f) => sum + f.valor, 0).toFixed(2)}</p>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Vendedora</th>
                            <th>Cliente</th>
                            <th>Status</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fechamentosMes.map(f => `
                            <tr>
                                <td>${formatarData(f.data)}</td>
                                <td>${f.vendedora}</td>
                                <td>${f.cliente}</td>
                                <td>
                                    <span class="status-badge ${f.status === 'Pago e Assinado' ? 'status-pago' : 'status-assinado'}">
                                        ${f.status}
                                    </span>
                                </td>
                                <td>R$ ${f.valor.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Popular Filtros
function popularFiltros() {
    // Meses para filtro
    const meses = [...new Set(fechamentos.map(f => f.data.substring(0, 7)))].sort();
    const filtroMes = document.getElementById('filtro-mes');
    const mesDashboard = document.getElementById('mes-dashboard');
    
    filtroMes.innerHTML = '<option value="">Todos os Meses</option>' +
        meses.map(m => {
            const [ano, mesNum] = m.split('-');
            const nomeMes = obterNomeMes(parseInt(mesNum));
            return `<option value="${m}">${nomeMes} ${ano}</option>`;
        }).join('');
    
    mesDashboard.innerHTML = '<option value="">Selecionar Mês</option>' +
        meses.map(m => {
            const [ano, mesNum] = m.split('-');
            const nomeMes = obterNomeMes(parseInt(mesNum));
            return `<option value="${m}">${nomeMes} ${ano}</option>`;
        }).join('');
    
    // Vendedoras para filtro
    const vendedoras = [...new Set(fechamentos.map(f => f.vendedora))].sort();
    document.getElementById('filtro-vendedora').innerHTML = 
        '<option value="">Todas as Vendedoras</option>' +
        vendedoras.map(v => `<option value="${v}">${v}</option>`).join('');
}

// Event listeners para filtros do dashboard
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mes-dashboard').addEventListener('change', atualizarDashboard);
});

// Exportar dados
function exportarDados() {
    const dados = JSON.stringify(fechamentos, null, 2);
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `fechamentos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Funções auxiliares
function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function obterNomeMes(mes) {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 
        'Maio', 'Junho', 'Julho', 'Agosto',
        'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modal-fechamento');
    if (event.target === modal) {
        fecharModal();
    }
}
