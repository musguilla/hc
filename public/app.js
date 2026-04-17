document.addEventListener('DOMContentLoaded', () => {
  // Add subtle mouse tracking to the phone mockup for a 3D effect
  const phone = document.querySelector('.phone-mockup');
  const container = document.querySelector('.hero-visual');

  if (window.innerWidth > 900) {
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const rotateX = (y / (rect.height / 2)) * -5 + 5;
      const rotateY = (x / (rect.width / 2)) * 10 - 10;
      
      phone.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    });

    container.addEventListener('mouseleave', () => {
      phone.style.transform = `rotateY(-10deg) rotateX(5deg)`;
    });
  }
});
