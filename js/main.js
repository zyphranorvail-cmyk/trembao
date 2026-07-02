window.dataLayer = window.dataLayer || [];
document.querySelectorAll('[data-whatsapp]').forEach(link => {
    link.href = WHATSAPP_URL;
    link.addEventListener('click', function() {
                let clickLocation = 'unknown';
        if (this.classList.contains('btn-hero')) {
            clickLocation = 'hero_section';
        } else if (this.classList.contains('btn-header')) {
            clickLocation = 'header';
        } else if (this.classList.contains('btn-large')) {
            clickLocation = 'cta_section';
        } else if (this.classList.contains('whatsapp-float')) {
            clickLocation = 'floating_button';
        }
        dataLayer.push({
            'event': 'whatsapp_click',
            'click_location': clickLocation,
            'button_text': this.textContent.trim() || 'WhatsApp'
        });
    });
});
document.querySelectorAll('[data-phone]').forEach(link => {
    link.href = PHONE_LINK;
    link.textContent = PHONE_DISPLAY;
    link.addEventListener('click', function() {
        dataLayer.push({
            'event': 'phone_click',
            'click_location': 'footer'
        });
    });
});
document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('click', function() {
        const size = this.querySelector('.pricing-size').textContent;
        const price = this.querySelector('.pricing-price').textContent;
        dataLayer.push({
            'event': 'pricing_card_click',
            'cacamba_size': size,
            'cacamba_price': price
        });
    });
});
const sections = ['hero', 'servicos', 'precos', 'sobre-nos', 'contato'];
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};
const sectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sections.includes(sectionId)) {
                dataLayer.push({
                    'event': 'section_view',
                    'section_name': sectionId
                });
            }
        }
    });
}, observerOptions);
sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
        sectionObserver.observe(section);
    }
});
document.querySelectorAll('a[href^="#"]:not([data-whatsapp]):not([data-phone])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            dataLayer.push({
                'event': 'anchor_click',
                'anchor_target': this.getAttribute('href')
            });
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});