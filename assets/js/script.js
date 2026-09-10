// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Contact form: no backend yet, so open the user's email client with the message pre-filled
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const fullName = contactForm.fullName.value.trim();
    const email = contactForm.email.value.trim();
    const subject = contactForm.subject.value;
    const message = contactForm.message.value.trim();

    const body = `Name: ${fullName}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:yourmail@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    formNote.textContent = 'Opening your email client to send this message…';
    formNote.hidden = false;
  });
}

// Portfolio PDF download placeholder until a real file is provided
const downloadPdf = document.getElementById('downloadPdf');

if (downloadPdf) {
  downloadPdf.addEventListener('click', (event) => {
    event.preventDefault();
    alert('Add your portfolio PDF to assets/ and update this link to point to it.');
  });
}
