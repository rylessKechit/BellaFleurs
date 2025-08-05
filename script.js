// Système de filtres pour la galerie
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease-in-out';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});

// Animation des témoignages en carousel
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial');

function rotateTestimonials() {
    if (testimonials.length > 0) {
        testimonials.forEach((testimonial, index) => {
            testimonial.style.transform = `translateX(${(index - currentTestimonial) * 100}%)`;
        });
        
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    }
}

// Démarrer la rotation des témoignages (optionnel)
// setInterval(rotateTestimonials, 5000);

// Animation des étapes du savoir-faire
const steps = document.querySelectorAll('.step');
const stepsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 200);
        }
    });
}, { threshold: 0.2 });

document.addEventListener('DOMContentLoaded', () => {
    steps.forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(30px)';
        step.style.transition = 'all 0.6s ease-out';
        stepsObserver.observe(step);
    });
});

// Animation au clic sur les éléments de la galerie
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
        // Créer un effet de zoom temporaire
        this.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
    });
});

// Effet de compteur pour les statistiques des témoignages
function animateStars() {
    const starsContainers = document.querySelectorAll('.stars');
    
    starsContainers.forEach(container => {
        const stars = container.querySelectorAll('i');
        stars.forEach((star, index) => {
            star.style.opacity = '0';
            star.style.transform = 'scale(0)';
            
            setTimeout(() => {
                star.style.opacity = '1';
                star.style.transform = 'scale(1)';
                star.style.transition = 'all 0.3s ease-out';
            }, index * 100);
        });
    });
}

// Observer pour les témoignages
const testimonialsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStars();
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const testimonialsSection = document.querySelector('.testimonials');
    if (testimonialsSection) {
        testimonialsObserver.observe(testimonialsSection);
    }
});

// Effet hover amélioré pour les cartes d'événements
document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.event-icon');
        icon.style.transform = 'rotate(10deg) scale(1.1)';
        icon.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.event-icon');
        icon.style.transform = 'rotate(0deg) scale(1)';
    });
});

// Animation progressive des services dans les cartes d'événements
const eventCardsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const services = entry.target.querySelectorAll('.event-services li');
            services.forEach((service, index) => {
                setTimeout(() => {
                    service.style.opacity = '1';
                    service.style.transform = 'translateX(0)';
                }, index * 150);
            });
        }
    });
}, { threshold: 0.3 });

document.addEventListener('DOMContentLoaded', () => {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        const services = card.querySelectorAll('.event-services li');
        services.forEach(service => {
            service.style.transition = 'all 0.4s ease-out';
        });
        eventCardsObserver.observe(card);
    });
});

// Amélioration de l'effet parallax sur les sections
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    // Parallax sur le hero
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
    
    // Effet sur les fleurs flottantes
    const flowers = document.querySelectorAll('.floating-flowers .flower');
    flowers.forEach((flower, index) => {
        const speed = 0.2 + (index * 0.1);
        flower.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Animation de chargement de la page
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animation séquentielle des éléments du hero
    const heroElements = [
        document.querySelector('.hero h1'),
        document.querySelector('.hero p'),
        document.querySelector('.cta-button')
    ];
    
    heroElements.forEach((element, index) => {
        if (element) {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 300);
        }
    });
});

// Gestion du menu mobile (si ajouté plus tard)
const createMobileMenu = () => {
    const nav = document.querySelector('nav');
    const menuToggle = document.createElement('div');
    menuToggle.classList.add('menu-toggle');
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    menuToggle.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('mobile-active');
    });
    
    nav.appendChild(menuToggle);
};

// Initialiser le menu mobile sur petits écrans
if (window.innerWidth <= 768) {
    createMobileMenu();
}

// Redimensionnement de fenêtre
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && !document.querySelector('.menu-toggle')) {
        createMobileMenu();
    } else if (window.innerWidth > 768 && document.querySelector('.menu-toggle')) {
        document.querySelector('.menu-toggle').remove();
        document.querySelector('.nav-links').classList.remove('mobile-active');
    }
});

console.log('🌸 Bella Fleurs - Site chargé avec succès ! 🌸');// Animation des pétales qui tombent
function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('petal');
    
    // Position aléatoire
    petal.style.left = Math.random() * 100 + '%';
    petal.style.animationDuration = (Math.random() * 3 + 2) + 's';
    petal.style.opacity = Math.random() * 0.5 + 0.3;
    
    // Couleur aléatoire dans la palette
    const colors = [
        'linear-gradient(45deg, #ff6b9d, #ffc1cc)',
        'linear-gradient(45deg, #c73650, #ff6b9d)',
        'linear-gradient(45deg, #ffb3ba, #ffc1cc)'
    ];
    petal.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    document.getElementById('petals').appendChild(petal);
    
    // Supprimer le pétale après l'animation
    setTimeout(() => {
        petal.remove();
    }, 5000);
}

// Créer des pétales périodiquement
setInterval(createPetal, 300);

// Header qui change au scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Animation au scroll pour les éléments
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer les éléments à animer
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.creation-card, .contact-info, .contact-form');
    
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
    
    // Animation des statistiques au scroll
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
});

// Animation des chiffres
function animateNumber(element) {
    const finalNumber = element.textContent;
    const duration = 2000;
    const increment = finalNumber.includes('+') ? 
        parseInt(finalNumber) / (duration / 50) : 
        (finalNumber === '100%' ? 100 / (duration / 50) : 
         parseInt(finalNumber) / (duration / 50));
    
    let current = 0;
    const timer = setInterval(() => {
        current += increment;
        if (finalNumber.includes('+')) {
            element.textContent = Math.floor(current) + '+';
            if (current >= parseInt(finalNumber)) {
                element.textContent = finalNumber;
                clearInterval(timer);
            }
        } else if (finalNumber === '100%') {
            element.textContent = Math.floor(current) + '%';
            if (current >= 100) {
                element.textContent = '100%';
                clearInterval(timer);
            }
        } else {
            element.textContent = Math.floor(current);
            if (current >= parseInt(finalNumber)) {
                element.textContent = finalNumber;
                clearInterval(timer);
            }
        }
    }, 50);
}

// Scroll fluide pour les liens de navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.getElementById('header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Animation du formulaire de contact
document.querySelector('.contact-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    // Animation de soumission
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    submitBtn.disabled = true;
    
    // Simuler l'envoi
    setTimeout(() => {
        submitBtn.textContent = 'Message envoyé ✓';
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = 'linear-gradient(135deg, #ff6b9d, #c73650)';
            submitBtn.disabled = false;
            // Reset du formulaire
            this.reset();
        }, 2000);
    }, 1500);
});

// Effet parallax léger sur le hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Animation hover sur les cartes de création
document.querySelectorAll('.creation-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Ajout d'une classe active aux liens de navigation selon la section visible
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Effet de typing sur le titre principal
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Activer l'effet de typing au chargement
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 150);
    }
});

// Animation des fleurs flottantes
document.querySelectorAll('.flower').forEach((flower, index) => {
    flower.addEventListener('click', () => {
        flower.style.animation = 'none';
        flower.style.transform = 'scale(1.5) rotate(360deg)';
        flower.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            flower.style.transform = 'scale(1) rotate(0deg)';
            flower.style.animation = `floatFlower 4s ease-in-out infinite`;
            flower.style.animationDelay = `${index}s`;
        }, 500);
    });
});

// Effet de particules au clic sur le CTA
document.querySelector('.cta-button').addEventListener('click', function(e) {
    createParticles(e.pageX, e.pageY);
});

function createParticles(x, y) {
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.background = '#ff6b9d';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        const angle = (i * 60) * Math.PI / 180;
        const velocity = 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            { 
                transform: `translate(${vx}px, ${vy}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => particle.remove();
        
        document.body.appendChild(particle);
    }
}

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    // Recalculer les positions si nécessaire
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = 'translateY(0)';
    }
});

// Animation d'entrée pour les éléments du footer
const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.opacity = '0';
        footer.style.transform = 'translateY(20px)';
        footerObserver.observe(footer);
    }
});

// Console log artistique
console.log(`
🌸 Bella Fleurs - Créations Florales d'Exception 🌸
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Site développé avec ❤️ 
Des animations délicates pour une expérience florale unique
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Amélioration de l'accessibilité
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});