// ============================================
// SISTEMA PROFISSIONAL - CONTROLE DE FECHAMENTO
// ============================================

// Configurações Globais
const CONFIG = {
    appName: 'Controle de Fechamento',
    version: '2.0.0',
    storageKey: 'fechamentosData_v2',
    metaMensal: 50, // Meta de fechamentos por mês
    periodoAtual: 'mes',
    temaAtual: 'light'
};

// Estado Global
let state = {
    fechamentos: [],
    proximoId: 1,
    fechamentoEditando: null,
    filtrosAtivos: {
        dataInicio: '',
        dataFim: '',
        vendedora: '',
        status: '',
        busca: ''
    },
    paginaAtual: 1,
    itensPorPagina: 10,
    notificacoes: []
};

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

function inicializarApp() {
    // Loading Screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1500);
    
    // Carregar dados
    carregarDados();
    
    // Inicializar componentes
    inicializarDataAtual();
    popularFiltrosVendedoras();
    popularMesesDashboard();
    
    // Atualizar todas as views
    atualizarDashboard();
    atualizarTabelaFechamentos();
    atualizarPastasMensais();
    atualizarBadges();
    atualizarTabelaRecentes();
    
    // Event Listeners Globais
    document.getElementById('mesDashboard').addEventListener('change', atualizarDashboard);
    document.getElementById('globalSearch').addEventListener('keyup', buscaGlobal);
    
    // Fechar modal ao clicar fora
    document.getElementById('modalFechamento').addEventListener('click', function(e) {
        if (e.target === this) fecharModalFechamento();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    console.log('✅ Sistema inicializado com sucesso!');
}

// ==================== DADOS ====================
function carregarDados() {
    const dadosSalvos = localStorage.getItem(CONFIG.storageKey);
    
    if (dadosSalvos) {
        try {
            const data = JSON.parse(dadosSalvos);
            state.fechamentos = data.fechamentos || [];
            state.proximoId = data.proximoId || 1;
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            inicializarDadosDemo();
        }
    } else {
        inicializarDadosDemo();
    }
}

function inicializarDadosDemo() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    state.fechamentos = [
        {
            id: 1,
            data: `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-05`,
            vendedora: 'Ana Silva',
            horario: '14:30',
            cliente: 'Tech Solutions Ltda',
            marca: 'TechPro Inovação',
            status: 'Pago e Assinado',
            valor: 3500.00,
            observacoes: 'Registro prioritário'
        },
        {
            id: 2,
            data: `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-08`,
            vendedora: 'Maria Oliveira',
            horario: '10:15',
            cliente: 'Digital Brands SA',
            marca: 'InnovaBrand',
            status: 'Pago e Assinado',
            valor: 2800.00,
            observacoes: ''
        },
        {
            id: 3,
            data: `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-12`,
            vendedora: 'Carla Santos',
            horario: '16:45',
            cliente: 'Global Marcas Ltda',
            marca: 'MarketPlus',
            status: 'Apenas Assinado',
            valor: 4200.00,
            observacoes: 'Pagamento em 30 dias'
        },
        {
            id: 4,
            data: `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-15`,
            vendedora: 'Ana Silva',
            horario: '09:00',
            cliente: 'Inovação Digital',
            marca: 'TechStart',
            status: 'Pago e Assinado',
            valor: 5100.00,
            observacoes: 'Cliente VIP'
        },
        {
            id: 5,
            data: `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-20`,
            vendedora: 'Maria Oliveira',
            horario: '15:30',
            cliente: 'Comércio Express',
            marca: 'FastBrand',
            status: 'Apenas Assinado',
            valor: 1900.00,
            observacoes: ''
        }
    ];
    
    state.proximoId = 6;
    salvarDados();
}

function salvarDados() {
    const dadosParaSalvar = {
        fechamentos: state.fechamentos,
        proximoId: state.proximoId
    };
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(dadosParaSalvar));
}

// ==================== NAVEGAÇÃO ====================
function showPage(pageName, element) {
    // Atualizar menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
    }
    
    // Mostrar página correta
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    const pageElement = document.getElementById(`${pageName}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // Atualizar breadcrumb
    const pageNames = {
        dashboard: 'Dashboard',
        planilha: 'Fechamentos',
        historico: 'Histórico Mensal',
        relatorios: 'Relatórios',
        metas: 'Metas',
        configuracoes: 'Configurações'
    };
    
    document.getElementById('currentPage').textContent = pageNames[pageName] || pageName;
    
    // Atualizar conteúdo
    switch(pageName) {
        case 'dashboard':
            atualizarDashboard();
            break;
        case 'planilha':
            atualizarTabelaFechamentos();
            break;
        case 'historico':
            atualizarPastasMensais();
            break;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
}

// ==================== DASHBOARD ====================
function atualizarDashboard() {
    const dadosFiltrados = getDadosPeriodo();
    
    // Atualizar métricas
    atualizarMetricas(dadosFiltrados);
    
    // Atualizar gráficos
    atualizarGraficoVendedoras(dadosFiltrados);
    atualizarGraficoStatus(dadosFiltrados);
    
    // Atualizar tabela de recentes
    atualizarTabelaRecentes();
}

function getDadosPeriodo() {
    const periodo = CONFIG.periodoAtual;
    const hoje = new Date();
    let dataInicio;
    
    switch(periodo) {
        case 'hoje':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
            break;
        case 'semana':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 7);
            break;
        case 'mes':
        default:
            const mesSelecionado = document.getElementById('mesDashboard').value;
            if (mesSelecionado) {
                const [ano, mes] = mesSelecionado.split('-');
                dataInicio = new Date(parseInt(ano), parseInt(mes) - 1, 1);
                const dataFim = new Date(parseInt(ano), parseInt(mes), 0);
                return state.fechamentos.filter(f => {
                    const data = new Date(f.data);
                    return data >= dataInicio && data <= dataFim;
                });
            }
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            break;
    }
    
    return state.fechamentos.filter(f => new Date(f.data) >= dataInicio);
}

function atualizarMetricas(dados) {
    const total = dados.length;
    const pagos = dados.filter(f => f.status === 'Pago e Assinado').length;
    const assinados = dados.filter(f => f.status === 'Apenas Assinado').length;
    const valorTotal = dados.reduce((sum, f) => sum + f.valor, 0);
    
    // Animar números
    animarContador('totalFechamentos', total);
    animarContador('pagosAssinados', pagos);
    animarContador('apenasAssinados', assinados);
    
    // Melhor vendedora
    const vendedoras = {};
    dados.forEach(f => {
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
    
    document.getElementById('melhorVendedora').textContent = melhorVendedora.nome;
    document.getElementById('vendasMelhor').textContent = `${melhorVendedora.quantidade} vendas`;
    
    // Tendências (simulado para demo)
    const tendenciaAnterior = total > 0 ? ((total - 1) / total * 100).toFixed(0) : 0;
    document.getElementById('trendTotal').innerHTML = 
        `<i class="fas fa-arrow-up"></i> ${tendenciaAnterior}%`;
}

function animarContador(elementId, valorFinal) {
    const element = document.getElementById(elementId);
    const valorInicial = parseInt(element.textContent) || 0;
    const duracao = 1000;
    const inicio = performance.now();
    
    function atualizar(timestamp) {
        const decorrido = timestamp - inicio;
        const progresso = Math.min(decorrido / duracao, 1);
        const valorAtual = Math.floor(valorInicial + (valorFinal - valorInicial) * progresso);
        
        element.textContent = valorAtual;
        
        if (progresso < 1) {
            requestAnimationFrame(atualizar);
        }
    }
    
    requestAnimationFrame(atualizar);
}

function atualizarGraficoVendedoras(dados) {
    const vendedoras = {};
    dados.forEach(f => {
        if (!vendedoras[f.vendedora]) {
            vendedoras[f.vendedora] = { pagos: 0, assinados: 0, total: 0 };
        }
        if (f.status === 'Pago e Assinado') vendedoras[f.vendedora].pagos++;
        else vendedoras[f.vendedora].assinados++;
        vendedoras[f.vendedora].total++;
    });
    
    const chartBody = document.getElementById('chartVendedoras');
    const maxValor = Math.max(...Object.values(vendedoras).map(v => v.total), 1);
    
    chartBody.innerHTML = Object.entries(vendedoras)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([nome, dados]) => `
            <div class="chart-bar-item">
                <div class="chart-bar-label">
                    <span>${nome}</span>
                    <span>${dados.total} vendas</span>
                </div>
                <div class="chart-bar-container">
                    <div class="chart-bar" style="width: ${(dados.total / maxValor) * 100}%">
                        <div class="chart-bar-segment pagos" style="width: ${(dados.pagos / dados.total) * 100}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
}

function atualizarGraficoStatus(dados) {
    const total = dados.length;
    const pagos = dados.filter(f => f.status === 'Pago e Assinado').length;
    const percentual = total > 0 ? (pagos / total) * 100 : 0;
    
    const circunferencia = 2 * Math.PI * 70;
    const offset = circunferencia - (percentual / 100) * circunferencia;
    
    document.getElementById('donutPagos').style.strokeDasharray = `${circunferencia - offset} ${circunferencia}`;
    document.getElementById('donutPercent').textContent = `${Math.round(percentual)}%`;
}

function mudarPeriodo(periodo, element) {
    CONFIG.periodoAtual = periodo;
    
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    atualizarDashboard();
}

function atualizarTabelaRecentes() {
    const tbody = document.getElementById('tabelaRecentes');
    const recentes = state.fechamentos.slice(-5).reverse();
    
    if (recentes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #cbd5e1;"></i>
                    <p>Nenhum fechamento recente</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = recentes.map(f => `
        <tr>
            <td>${formatarData(f.data)}</td>
            <td>
                <div class="vendedora-info">
                    <div class="avatar-small">${f.vendedora.charAt(0)}</div>
                    <span>${f.vendedora}</span>
                </div>
            </td>
            <td>${f.cliente}</td>
            <td><span class="badge-status ${f.status === 'Pago e Assinado' ? 'pago' : 'assinado'}">${f.status}</span></td>
            <td class="valor-cell">R$ ${f.valor.toFixed(2)}</td>
            <td>
                <button class="btn-action edit" onclick="editarFechamento(${f.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete" onclick="excluirFechamento(${f.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==================== PLANILHA DE FECHAMENTOS ====================
function atualizarTabelaFechamentos() {
    aplicarFiltros();
}

function aplicarFiltros() {
    let dadosFiltrados = [...state.fechamentos];
    
    // Aplicar filtros
    const { dataInicio, dataFim, vendedora, status, busca } = state.filtrosAtivos;
    
    if (dataInicio) {
        dadosFiltrados = dadosFiltrados.filter(f => f.data >= dataInicio);
    }
    
    if (dataFim) {
        dadosFiltrados = dadosFiltrados.filter(f => f.data <= dataFim);
    }
    
    if (vendedora) {
        dadosFiltrados = dadosFiltrados.filter(f => f.vendedora === vendedora);
    }
    
    if (status) {
        dadosFiltrados = dadosFiltrados.filter(f => f.status === status);
    }
    
    if (busca) {
        const termo = busca.toLowerCase();
        dadosFiltrados = dadosFiltrados.filter(f => 
            f.vendedora.toLowerCase().includes(termo) ||
            f.cliente.toLowerCase().includes(termo) ||
            f.marca.toLowerCase().includes(termo)
        );
    }
    
    // Ordenar por data (mais recente primeiro)
    dadosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Paginação
    const total = dadosFiltrados.length;
    const inicio = (state.paginaAtual - 1) * state.itensPorPagina;
    const fim = inicio + state.itensPorPagina;
    const dadosPaginados = dadosFiltrados.slice(inicio, fim);
    
    // Renderizar
    renderizarTabela(dadosPaginados);
    atualizarPaginacao(total);
    
    // Atualizar contador
    document.getElementById('contadorFiltros').textContent = `${total} resultado(s)`;
    document.getElementById('mostrandoDe').textContent = Math.min(fim, total);
    document.getElementById('totalRegistros').textContent = total;
}

function renderizarTabela(dados) {
    const tbody = document.getElementById('tabelaFechamentos');
    
    if (dados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-search" style="font-size: 48px; color: #cbd5e1;"></i>
                    <p>Nenhum fechamento encontrado</p>
                    <button class="btn-primary" onclick="abrirModalFechamento()">
                        <i class="fas fa-plus"></i> Novo Fechamento
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = dados.map(f => `
        <tr>
            <td><input type="checkbox" class="select-item" value="${f.id}"></td>
            <td>${formatarData(f.data)}</td>
            <td>
                <div class="vendedora-info">
                    <div class="avatar-small">${f.vendedora.charAt(0)}</div>
                    <span>${f.vendedora}</span>
                </div>
            </td>
            <td>${f.horario}</td>
            <td>${f.cliente}</td>
            <td>${f.marca}</td>
            <td><span class="badge-status ${f.status === 'Pago e Assinado' ? 'pago' : 'assinado'}">${f.status}</span></td>
            <td class="valor-cell">R$ ${f.valor.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action edit" onclick="editarFechamento(${f.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="excluirFechamento(${f.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function atualizarPaginacao(total) {
    const totalPaginas = Math.ceil(total / state.itensPorPagina);
    const pagination = document.querySelector('.pagination');
    
    let html = `
        <button class="btn-page" ${state.paginaAtual === 1 ? 'disabled' : ''} 
                onclick="mudarPagina(${state.paginaAtual - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPaginas; i++) {
        if (i <= 5 || i === totalPaginas) {
            html += `
                <button class="btn-page ${state.paginaAtual === i ? 'active' : ''}" 
                        onclick="mudarPagina(${i})">${i}</button>
            `;
        } else if (i === 6 && totalPaginas > 6) {
            html += '<span class="page-dots">...</span>';
        }
    }
    
    html += `
        <button class="btn-page" ${state.paginaAtual === totalPaginas ? 'disabled' : ''} 
                onclick="mudarPagina(${state.paginaAtual + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = html;
}

function mudarPagina(pagina) {
    state.paginaAtual = pagina;
    aplicarFiltros();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFiltros() {
    state.filtrosAtivos = {
        dataInicio: '',
        dataFim: '',
        vendedora: '',
        status: '',
        busca: ''
    };
    
    document.getElementById('filtroDataInicio').value = '';
    document.getElementById('filtroDataFim').value = '';
    document.getElementById('filtroVendedora').value = '';
    document.getElementById('filtroStatus').value = '';
    document.getElementById('filtroBusca').value = '';
    
    state.paginaAtual = 1;
    aplicarFiltros();
}

function selecionarTodos() {
    const selectAll = document.getElementById('selectAll');
    document.querySelectorAll('.select-item').forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

function popularFiltrosVendedoras() {
    const vendedoras = [...new Set(state.fechamentos.map(f => f.vendedora))].sort();
    const select = document.getElementById('filtroVendedora');
    
    select.innerHTML = '<option value="">Todas</option>' +
        vendedoras.map(v => `<option value="${v}">${v}</option>`).join('');
}

function popularMesesDashboard() {
    const meses = new Set();
    state.fechamentos.forEach(f => {
        const [ano, mes] = f.data.split('-');
        meses.add(`${ano}-${mes}`);
    });
    
    const mesesOrdenados = [...meses].sort().reverse();
    const select = document.getElementById('mesDashboard');
    
    select.innerHTML = '<option value="">Mês Atual</option>' +
        mesesOrdenados.map(m => {
            const [ano, mes] = m.split('-');
            const nomeMes = obterNomeMes(parseInt(mes));
            return `<option value="${m}">${nomeMes} ${ano}</option>`;
        }).join('');
}

// ==================== MODAL DE FECHAMENTO ====================
function abrirModalFechamento(id = null) {
    const modal = document.getElementById('modalFechamento');
    const form = document.getElementById('formFechamento');
    
    form.reset();
    state.fechamentoEditando = null;
    
    if (id) {
        // Modo edição
        const fechamento = state.fechamentos.find(f => f.id === id);
        if (fechamento) {
            state.fechamentoEditando = id;
            document.getElementById('modalTitle').textContent = 'Editar Fechamento';
            
            document.getElementById('inputData').value = fechamento.data;
            document.getElementById('inputVendedora').value = fechamento.vendedora;
            document.getElementById('inputHorario').value = fechamento.horario;
            document.getElementById('inputCliente').value = fechamento.cliente;
            document.getElementById('inputMarca').value = fechamento.marca;
            document.getElementById('inputStatus').value = fechamento.status;
            document.getElementById('inputValor').value = fechamento.valor;
            document.getElementById('inputObservacoes').value = fechamento.observacoes || '';
        }
    } else {
        // Modo criação
        document.getElementById('modalTitle').textContent = 'Novo Fechamento';
        document.getElementById('inputData').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharModalFechamento() {
    const modal = document.getElementById('modalFechamento');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    state.fechamentoEditando = null;
}

function salvarFechamento(event) {
    event.preventDefault();
    
    // Validação
    const campos = ['inputData', 'inputVendedora', 'inputHorario', 'inputCliente', 'inputMarca', 'inputStatus', 'inputValor'];
    let valido = true;
    
    campos.forEach(campo => {
        const element = document.getElementById(campo);
        if (!element.value) {
            element.classList.add('error');
            valido = false;
        } else {
            element.classList.remove('error');
        }
    });
    
    if (!valido) {
        mostrarNotificacao('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    const dadosFechamento = {
        data: document.getElementById('inputData').value,
        vendedora: document.getElementById('inputVendedora').value,
        horario: document.getElementById('inputHorario').value,
        cliente: document.getElementById('inputCliente').value,
        marca: document.getElementById('inputMarca').value,
        status: document.getElementById('inputStatus').value,
        valor: parseFloat(document.getElementById('inputValor').value),
        observacoes: document.getElementById('inputObservacoes').value
    };
    
    if (state.fechamentoEditando) {
        // Atualizar existente
        const index = state.fechamentos.findIndex(f => f.id === state.fechamentoEditando);
        if (index !== -1) {
            state.fechamentos[index] = { ...state.fechamentos[index], ...dadosFechamento };
            mostrarNotificacao('Fechamento atualizado com sucesso!', 'success');
        }
    } else {
        // Criar novo
        const novoFechamento = {
            id: state.proximoId++,
            ...dadosFechamento
        };
        state.fechamentos.push(novoFechamento);
        mostrarNotificacao('Fechamento criado com sucesso!', 'success');
    }
    
    salvarDados();
    fecharModalFechamento();
    atualizarDashboard();
    atualizarTabelaFechamentos();
    atualizarPastasMensais();
    atualizarBadges();
    popularFiltrosVendedoras();
    popularMesesDashboard();
}

function editarFechamento(id) {
    abrirModalFechamento(id);
}

function excluirFechamento(id) {
    const fechamento = state.fechamentos.find(f => f.id === id);
    if (!fechamento) return;
    
    // Modal de confirmação personalizado
    if (confirm(`Tem certeza que deseja excluir o fechamento de ${fechamento.cliente}?`)) {
        state.fechamentos = state.fechamentos.filter(f => f.id !== id);
        salvarDados();
        atualizarDashboard();
        atualizarTabelaFechamentos();
        atualizarPastasMensais();
        mostrarNotificacao('Fechamento excluído com sucesso!', 'success');
    }
}

// ==================== HISTÓRICO MENSAL ====================
function atualizarPastasMensais() {
    const container = document.getElementById('pastasMensais');
    
    // Agrupar por mês
    const meses = {};
    state.fechamentos.forEach(f => {
        const chave = f.data.substring(0, 7);
        if (!meses[chave]) {
            meses[chave] = [];
        }
        meses[chave].push(f);
    });
    
    if (Object.keys(meses).length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <i class="fas fa-folder-open" style="font-size: 64px; color: #cbd5e1;"></i>
                <h3>Nenhum mês disponível</h3>
                <p>Comece adicionando fechamentos</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = Object.entries(meses)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([mes, fechamentosMes]) => {
            const [ano, mesNum] = mes.split('-');
            const nomeMes = obterNomeMes(parseInt(mesNum));
            const totalVendas = fechamentosMes.length;
            const valorTotal = fechamentosMes.reduce((sum, f) => sum + f.valor, 0);
            const pagos = fechamentosMes.filter(f => f.status === 'Pago e Assinado').length;
            
            return `
                <div class="folder-card" onclick="abrirPastaMes('${mes}')">
                    <div class="folder-icon-large">📁</div>
                    <div class="folder-name">${nomeMes} ${ano}</div>
                    <div class="folder-stats">
                        <div class="folder-stat">
                            <i class="fas fa-shopping-cart"></i>
                            <strong>${totalVendas}</strong> vendas
                        </div>
                        <div class="folder-stat">
                            <i class="fas fa-check-circle"></i>
                            <strong>${pagos}</strong> pagos
                        </div>
                    </div>
                    <div class="folder-stat" style="margin-top: 8px;">
                        <i class="fas fa-dollar-sign"></i>
                        <strong>R$ ${valorTotal.toFixed(2)}</strong>
                    </div>
                </div>
            `;
        }).join('');
}

function abrirPastaMes(mes) {
    const [ano, mesNum] = mes.split('-');
    const nomeMes = obterNomeMes(parseInt(mesNum));
    const fechamentosMes = state.fechamentos.filter(f => f.data.startsWith(mes));
    
    // Criar modal com detalhes
    const modalHTML = `
        <div class="modal-overlay active" onclick="this.remove()">
            <div class="modal-premium" onclick="event.stopPropagation()">
                <div class="modal-header-premium">
                    <div class="modal-title-area">
                        <div class="modal-icon-circle" style="background: #ffc107; color: #1a237e;">
                            <i class="fas fa-folder-open"></i>
                        </div>
                        <div>
                            <h3>${nomeMes} ${ano}</h3>
                            <p>${fechamentosMes.length} fechamentos</p>
                        </div>
                    </div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-form">
                    <div class="metrics-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
                        <div class="metric-card primary">
                            <div class="metric-content">
                                <span class="metric-label">Total de Vendas</span>
                                <h3 class="metric-value">${fechamentosMes.length}</h3>
                            </div>
                        </div>
                        <div class="metric-card success">
                            <div class="metric-content">
                                <span class="metric-label">Valor Total</span>
                                <h3 class="metric-value" style="font-size: 24px;">R$ ${fechamentosMes.reduce((sum, f) => sum + f.valor, 0).toFixed(2)}</h3>
                            </div>
                        </div>
                        <div class="metric-card warning">
                            <div class="metric-content">
                                <span class="metric-label">Taxa de Conversão</span>
                                <h3 class="metric-value">${fechamentosMes.length > 0 ? Math.round((fechamentosMes.filter(f => f.status === 'Pago e Assinado').length / fechamentosMes.length) * 100) : 0}%</h3>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table-modern">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Vendedora</th>
                                    <th>Cliente</th>
                                    <th>Marca</th>
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
                                        <td>${f.marca}</td>
                                        <td><span class="badge-status ${f.status === 'Pago e Assinado' ? 'pago' : 'assinado'}">${f.status}</span></td>
                                        <td class="valor-cell">R$ ${f.valor.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: right;">
                        <button class="btn-primary" onclick="exportarDadosMes('${mes}')">
                            <i class="fas fa-download"></i> Exportar Mês
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ==================== NOTIFICAÇÕES ====================
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notification = document.createElement('div');
    notification.className = `toast-notification ${tipo}`;
    notification.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function mostrarNotificacoes() {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('active');
}

// ==================== EXPORTAÇÃO ====================
function exportarDados() {
    const dados = JSON.stringify(state.fechamentos, null, 2);
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `fechamentos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    mostrarNotificacao('Dados exportados com sucesso!', 'success');
}

function exportarDadosMes(mes) {
    const fechamentosMes = state.fechamentos.filter(f => f.data.startsWith(mes));
    const dados = JSON.stringify(fechamentosMes, null, 2);
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `fechamentos_${mes}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// ==================== BUSCA GLOBAL ====================
function buscaGlobal() {
    const termo = document.getElementById('globalSearch').value.toLowerCase();
    
    if (termo.length < 2) return;
    
    const resultados = state.fechamentos.filter(f => 
        f.vendedora.toLowerCase().includes(termo) ||
        f.cliente.toLowerCase().includes(termo) ||
        f.marca.toLowerCase().includes(termo)
    );
    
    if (resultados.length > 0) {
        showPage('planilha', document.querySelector('[onclick*="planilha"]'));
        state.filtrosAtivos.busca = termo;
        document.getElementById('filtroBusca').value = termo;
        aplicarFiltros();
    }
}

// ==================== UTILITÁRIOS ====================
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

function inicializarDataAtual() {
    document.getElementById('inputData').value = new Date().toISOString().split('T')[0];
}

function atualizarBadges() {
    const total = state.fechamentos.length;
    document.getElementById('badgeTotal').textContent = total;
    
    if (total > 0) {
        document.getElementById('badgeNew').style.display = 'none';
    }
}

function alternarTema() {
    CONFIG.temaAtual = CONFIG.temaAtual === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme');
    mostrarNotificacao(`Tema ${CONFIG.temaAtual === 'dark' ? 'escuro' : 'claro'} ativado!`, 'info');
}

function handleKeyboardShortcuts(e) {
    // Ctrl+N para novo fechamento
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        abrirModalFechamento();
    }
    
    // Ctrl+F para busca
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('globalSearch').focus();
    }
    
    // Escape para fechar modais
    if (e.key === 'Escape') {
        fecharModalFechamento();
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
    }
}

// ==================== INICIALIZAÇÃO FINAL ====================
console.log('🚀 Sistema Profissional de Controle de Fechamento');
console.log('📊 Versão:', CONFIG.version);
console.log('💡 Dica: Use Ctrl+N para novo fechamento, Ctrl+F para buscar');
