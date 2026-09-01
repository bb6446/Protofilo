import confetti from 'canvas-confetti';
import { saveUserInquiry } from '../firebase/db.js';

export class ContactController {
  constructor() {
    this.form = document.getElementById('inquiry-form');
    this.submitBtn = document.getElementById('inquiry-submit-btn');
    this.btnText = document.getElementById('submit-btn-text');
    this.btnSpinner = document.getElementById('submit-btn-spinner');
    this.alertBox = document.getElementById('inquiry-alert');
    
    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }

  async handleSubmit() {
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      projectType: formData.get('projectType'),
      quantity: formData.get('quantity'),
      message: formData.get('message')
    };

    // Simple validation
    if (!data.name || !data.email || !data.message) {
      this.showAlert('Please fill in your Name, Email, and Project Details.', 'error');
      return;
    }

    this.setLoading(true);

    try {
      const result = await saveUserInquiry(data);

      this.setLoading(false);

      if (result.success) {
        this.form.reset();
        this.showAlert(
          `🎉 Thank you, ${data.name}! Your project inquiry has been saved to Firebase Database. MD Biplob will contact you shortly via email/WhatsApp.`,
          'success'
        );

        // Trigger celebratory confetti
        this.fireConfetti();
      } else {
        this.showAlert('Unable to submit inquiry at this moment. Please reach out directly on WhatsApp!', 'error');
      }
    } catch (err) {
      this.setLoading(false);
      console.error('Submission failed:', err);
      this.showAlert('Something went wrong. Please connect directly via WhatsApp: +8801340276600', 'error');
    }
  }

  setLoading(isLoading) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isLoading;
    if (isLoading) {
      if (this.btnText) this.btnText.textContent = 'TRANSMITTING DATA...';
      if (this.btnSpinner) this.btnSpinner.style.display = 'inline-block';
      this.submitBtn.style.opacity = '0.7';
    } else {
      if (this.btnText) this.btnText.textContent = 'SEND INQUIRY TO DATABASE';
      if (this.btnSpinner) this.btnSpinner.style.display = 'none';
      this.submitBtn.style.opacity = '1';
    }
  }

  showAlert(message, type = 'success') {
    if (!this.alertBox) return;
    
    this.alertBox.textContent = message;
    this.alertBox.className = `inquiry-alert ${type}`;
    this.alertBox.style.display = 'block';

    // Auto dismiss after 9 seconds if success
    if (type === 'success') {
      setTimeout(() => {
        if (this.alertBox) {
          this.alertBox.style.display = 'none';
        }
      }, 9000);
    }
  }

  fireConfetti() {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f3ff', '#ff007f', '#00ff88', '#ffffff', '#ffaa00']
      });
    } catch (e) {
      // Ignore if confetti not supported
    }
  }
}
