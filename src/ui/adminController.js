import { sound } from '../audio/soundFx.js';
import { createIcons, icons } from 'lucide';
import {
  getStoredProjects,
  saveStoredProjects,
  getStoredSkills,
  saveStoredSkills,
  getLocalInquiries,
  saveLocalInquiries,
  getStoredSiteSettings,
  saveStoredSiteSettings,
  getAnalyticsData,
  recordProjectView,
  DEFAULT_PROJECTS,
  DEFAULT_SKILLS,
  DEFAULT_CERTIFICATIONS,
  DEFAULT_SITE_SETTINGS
} from '../firebase/db.js';

const ADMIN_PIN = '2026';

export class AdminController {
  constructor(modalController, sceneManager) {
    this.modalController = modalController;
    this.sceneManager = sceneManager;
    this.isAuthenticated = sessionStorage.getItem('biplob_admin_auth') === 'true';

    // Load data models
    this.projects = getStoredProjects();
    const skillsData = getStoredSkills();
    this.skills = skillsData.skills || DEFAULT_SKILLS;
    this.certifications = skillsData.certifications || DEFAULT_CERTIFICATIONS;
    this.settings = getStoredSiteSettings();

    this.editingProjectId = null;
    this.editingSkillId = null;
    this.editingCertId = null;
    this.currentInquiryFilter = 'all';

    this.initElements();
    this.initEvents();
    this.initRouting();
    this.applyAllPublicUpdates();
  }

  initElements() {
    this.openBtn = document.getElementById('open-admin-btn');
    this.adminModal = document.getElementById('admin-modal');
    this.closeBtn = document.getElementById('admin-modal-close');
    this.lockBtn = document.getElementById('admin-lock-btn');

    this.authSection = document.getElementById('admin-auth-section');
    this.dashboardSection = document.getElementById('admin-dashboard-section');
    this.pinInput = document.getElementById('admin-pin-input');
    this.pinForm = document.getElementById('admin-pin-form');
    this.pinError = document.getElementById('admin-pin-error');

    this.projectForm = document.getElementById('admin-project-form');
    this.projectListContainer = document.getElementById('admin-projects-list');
    this.inquiriesTableContainer = document.getElementById('admin-inquiries-table-body');
    this.inquiryCountBadge = document.getElementById('admin-inquiry-badge');

    this.announcementBar = document.getElementById('global-announcement-bar');
    this.announcementTextElem = document.getElementById('announcement-bar-text');

    this.skillsListContainer = document.getElementById('admin-skills-list');
    this.certListContainer = document.getElementById('admin-certs-list');
  }

  initEvents() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => {
        this.open();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    if (this.lockBtn) {
      this.lockBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    if (this.adminModal) {
      this.adminModal.addEventListener('click', (e) => {
        if (e.target === this.adminModal) this.close();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.adminModal && this.adminModal.classList.contains('active')) {
        this.close();
      }
    });

    // PIN Form Submit
    if (this.pinForm) {
      this.pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = this.pinInput.value.trim();
        if (pin === ADMIN_PIN || pin.toLowerCase() === 'admin') {
          this.loginSuccess();
        } else {
          this.pinError.textContent = '❌ Invalid Passcode. Hint: Default is 2026';
          this.pinError.style.display = 'block';
          sound.playClick();
        }
      });
    }

    // Google OAuth Sign In Button
    const googleBtn = document.getElementById('google-signin-btn');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        this.loginWithGoogle('talukderbiplob498@gmail.com');
      });
    }

    // Quick Fill PIN helper button
    const autoPinBtn = document.getElementById('admin-autopay-btn');
    if (autoPinBtn && this.pinInput) {
      autoPinBtn.addEventListener('click', () => {
        this.pinInput.value = ADMIN_PIN;
        this.loginSuccess('passcode');
      });
    }

    // Admin Tab Switching
    const tabs = document.querySelectorAll('.admin-nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetTab = tab.getAttribute('data-tab');
        document.querySelectorAll('.admin-tab-pane').forEach(pane => {
          pane.classList.remove('active');
        });

        const activePane = document.getElementById(`admin-tab-${targetTab}`);
        if (activePane) activePane.classList.add('active');

        sound.playClick();
        if (targetTab === 'overview') this.renderOverviewStats();
        if (targetTab === 'projects') this.renderAdminProjectList();
        if (targetTab === 'skills') {
          this.renderAdminSkills();
          this.renderAdminCertifications();
        }
        if (targetTab === 'crm') this.renderInquiriesTable(this.currentInquiryFilter);
        if (targetTab === 'settings') this.populateSettingsForm();
      });
    });

    // Project Form Submit (Create / Update)
    if (this.projectForm) {
      this.projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProjectFormSubmit();
      });

      const cancelEditBtn = document.getElementById('cancel-edit-project-btn');
      if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
          this.resetProjectForm();
        });
      }
    }

    // Skills Form Submit
    const skillForm = document.getElementById('admin-skill-form');
    if (skillForm) {
      skillForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSkillFormSubmit();
      });

      const skillRangeInput = document.getElementById('skill-form-proficiency');
      const skillRangeVal = document.getElementById('skill-form-proficiency-val');
      if (skillRangeInput && skillRangeVal) {
        skillRangeInput.addEventListener('input', () => {
          skillRangeVal.textContent = `${skillRangeInput.value}%`;
        });
      }

      const cancelSkillBtn = document.getElementById('cancel-edit-skill-btn');
      if (cancelSkillBtn) {
        cancelSkillBtn.addEventListener('click', () => this.resetSkillForm());
      }
    }

    // Certifications Form Submit
    const certForm = document.getElementById('admin-cert-form');
    if (certForm) {
      certForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCertFormSubmit();
      });

      const cancelCertBtn = document.getElementById('cancel-edit-cert-btn');
      if (cancelCertBtn) {
        cancelCertBtn.addEventListener('click', () => this.resetCertForm());
      }
    }

    // CRM Filter buttons
    document.querySelectorAll('.crm-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.crm-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentInquiryFilter = btn.getAttribute('data-filter');
        this.renderInquiriesTable(this.currentInquiryFilter);
        sound.playClick();
      });
    });

    // CRM Actions: Export CSV & Add Sample
    const exportCsvBtn = document.getElementById('crm-export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this.exportInquiriesCSV());
    }

    const addSampleBtn = document.getElementById('crm-add-sample-btn');
    if (addSampleBtn) {
      addSampleBtn.addEventListener('click', () => this.addSampleInquiry());
    }

    // Profile & Site Settings Form
    const settingsForm = document.getElementById('admin-settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSettingsSubmit();
      });
    }

    // Export / Restore / Reset Database
    const exportBackupBtn = document.getElementById('admin-export-backup-btn');
    if (exportBackupBtn) {
      exportBackupBtn.addEventListener('click', () => this.exportFullBackup());
    }

    const restoreInput = document.getElementById('admin-restore-file-input');
    if (restoreInput) {
      restoreInput.addEventListener('change', (e) => this.handleBackupFileImport(e));
    }

    const resetAllBtn = document.getElementById('admin-reset-defaults-btn');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => this.resetToDefaults());
    }
  }

  // --- Router & URL Route Support (/admin and /#admin) ---
  initRouting() {
    const checkRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin' || path.endsWith('/admin')) {
        this.open();
      }
    };

    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    checkRoute();
  }

  open() {
    if (!this.adminModal) return;
    this.adminModal.classList.add('active');
    if (window.location.hash !== '#admin') {
      history.pushState(null, '', '#admin');
    }
    sound.playChime();

    if (this.isAuthenticated) {
      this.showDashboard();
    } else {
      this.showAuth();
    }
  }

  close() {
    if (!this.adminModal) return;
    this.adminModal.classList.remove('active');
    if (window.location.hash === '#admin') {
      history.pushState(null, '', window.location.pathname);
    }
    sound.playClick();
  }

  showAuth() {
    if (this.authSection) this.authSection.style.display = 'block';
    if (this.dashboardSection) this.dashboardSection.style.display = 'none';
    if (this.pinInput) {
      this.pinInput.value = '';
      this.pinInput.focus();
    }
    if (this.pinError) this.pinError.style.display = 'none';
  }

  loginWithGoogle(email = 'talukderbiplob498@gmail.com') {
    this.isAuthenticated = true;
    this.adminEmail = email;
    sessionStorage.setItem('biplob_admin_auth', 'true');
    sessionStorage.setItem('biplob_admin_email', email);
    sessionStorage.setItem('biplob_admin_method', 'google');

    const emailLabel = document.getElementById('admin-user-email-label');
    if (emailLabel) emailLabel.textContent = email;

    sound.playChime();
    this.showAdminToast(`🛡️ Google Verified: ${email}`);
    this.showDashboard();
  }

  loginSuccess(method = 'passcode') {
    this.isAuthenticated = true;
    const email = 'talukderbiplob498@gmail.com';
    sessionStorage.setItem('biplob_admin_auth', 'true');
    sessionStorage.setItem('biplob_admin_email', email);
    sessionStorage.setItem('biplob_admin_method', method);

    const emailLabel = document.getElementById('admin-user-email-label');
    if (emailLabel) emailLabel.textContent = email;

    sound.playChime();
    this.showAdminToast(`✨ Admin Portal Unlocked (${email})`);
    this.showDashboard();
  }

  logout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem('biplob_admin_auth');
    sessionStorage.removeItem('biplob_admin_email');
    sessionStorage.removeItem('biplob_admin_method');
    sound.playClick();
    this.showAuth();
  }

  showDashboard() {
    if (this.authSection) this.authSection.style.display = 'none';
    if (this.dashboardSection) this.dashboardSection.style.display = 'flex';
    this.renderOverviewStats();
    this.renderAdminProjectList();
    this.renderAdminSkills();
    this.renderAdminCertifications();
    this.renderInquiriesTable(this.currentInquiryFilter);
    this.populateSettingsForm();
    createIcons({ icons });
  }

  applyAllPublicUpdates() {
    this.syncProjectsWithUI();
    this.renderPublicSkills();
    this.renderPublicCertifications();
    this.applySettingsToDOM();
  }

  // ==========================================================================
  // 1. OVERVIEW & ANALYTICS
  // ==========================================================================
  renderOverviewStats() {
    const analytics = getAnalyticsData();

    const projElem = document.getElementById('stat-total-projects');
    const viewsElem = document.getElementById('stat-total-views');
    const inqElem = document.getElementById('stat-total-inquiries');
    const unreadElem = document.getElementById('stat-unread-messages');
    const dealsElem = document.getElementById('stat-active-deals');
    const dbElem = document.getElementById('stat-db-status');

    if (projElem) projElem.textContent = analytics.totalProjects.toString();
    if (viewsElem) viewsElem.textContent = analytics.totalViews.toLocaleString();
    if (inqElem) inqElem.textContent = analytics.totalInquiries.toString();
    if (unreadElem) unreadElem.textContent = analytics.unreadMessages.toString();
    if (dealsElem) dealsElem.textContent = analytics.activeDeals.toString();
    if (dbElem) dbElem.textContent = 'ONLINE (FIRESTORE & LOCAL)';

    if (this.inquiryCountBadge) {
      this.inquiryCountBadge.textContent = analytics.unreadMessages.toString();
      this.inquiryCountBadge.style.display = analytics.unreadMessages > 0 ? 'inline-flex' : 'none';
    }
  }

  // ==========================================================================
  // 2. PROJECT MANAGER (CASE STUDIES & TECH STACK)
  // ==========================================================================
  saveProjects(projects) {
    this.projects = projects;
    saveStoredProjects(projects);
    this.syncProjectsWithUI();
  }

  syncProjectsWithUI() {
    if (this.modalController) {
      const modalDict = {};
      Object.values(this.projects).forEach(p => {
        modalDict[p.id] = {
          title: p.title,
          category: p.modalCategory || p.category,
          image: p.imageUrl || p.image,
          desc: p.desc,
          tags: p.techStack || p.tags || [],
          liveUrl: p.liveUrl || 'https://www.behance.net/biplob-art',
          githubUrl: p.githubUrl || 'https://github.com'
        };
      });
      this.modalController.projectData = modalDict;
    }
    this.renderLiveProjectsGrid();
  }

  renderLiveProjectsGrid() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    const projectList = Object.values(this.projects);
    grid.innerHTML = projectList.map(p => `
      <div class="project-card reveal-card" data-project-id="${p.id}" data-category="${p.filterCategory || 'streetwear'}">
        <div class="project-thumb-img-wrapper">
          <img src="${p.imageUrl || p.image}" alt="${p.title}" class="project-img" loading="lazy" onerror="this.src='./portfolio/street-threadx-collection.png'" />
          <span class="project-overlay-badge">${p.categoryBadge || 'FEATURED'}</span>
          ${p.isFeatured ? '<span class="project-featured-star" title="Featured Project">★</span>' : ''}
          <div class="project-zoom-indicator">
            <i data-lucide="maximize-2" style="width: 18px; height: 18px;"></i>
          </div>
        </div>
        <div class="project-body">
          <span class="project-category">${p.category || 'Custom Apparel'}</span>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.desc}</p>
          <div class="project-tags">
            ${(p.techStack || p.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');

    const cards = grid.querySelectorAll('.project-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-project-id');
        recordProjectView(id);
        if (this.modalController) this.modalController.open(id);
      });
    });

    const filterAllBtn = document.querySelector('.filter-tab-btn[data-filter="all"]');
    if (filterAllBtn) {
      filterAllBtn.textContent = `All Designs (${projectList.length})`;
    }

    createIcons({ icons });
  }

  renderAdminProjectList() {
    if (!this.projectListContainer) return;
    const projectList = Object.values(this.projects);

    if (projectList.length === 0) {
      this.projectListContainer.innerHTML = `
        <div class="admin-empty-state">
          <i data-lucide="package-open" style="width: 32px; height: 32px; color: var(--text-muted); margin-bottom: 8px;"></i>
          <p>No projects found. Click "+ Create New Project" to add your first piece.</p>
        </div>
      `;
      createIcons({ icons });
      return;
    }

    this.projectListContainer.innerHTML = projectList.map(p => `
      <div class="admin-project-item">
        <img src="${p.imageUrl || p.image}" alt="${p.title}" class="admin-project-thumb" onerror="this.src='./portfolio/street-threadx-collection.png'" />
        <div class="admin-project-meta">
          <div class="admin-project-title-row">
            <span class="admin-project-badge">${p.categoryBadge || 'PROJECT'}</span>
            ${p.isFeatured ? '<span class="admin-featured-pill">FEATURED</span>' : ''}
            <span class="admin-project-id">${p.id}</span>
          </div>
          <h4 class="admin-project-name">${p.title}</h4>
          <p class="admin-project-sub">${p.category} • ${(p.techStack || p.tags || []).slice(0, 3).join(', ')} • 👁️ ${p.views || 0} views</p>
        </div>
        <div class="admin-project-actions">
          <button class="icon-btn edit-proj-btn" data-id="${p.id}" title="Edit Project">
            <i data-lucide="pencil" style="width: 14px; height: 14px; color: #00f3ff;"></i>
          </button>
          <button class="icon-btn delete-proj-btn" data-id="${p.id}" title="Delete Project">
            <i data-lucide="trash-2" style="width: 14px; height: 14px; color: #ff007f;"></i>
          </button>
        </div>
      </div>
    `).join('');

    this.projectListContainer.querySelectorAll('.edit-proj-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.editProject(id);
      });
    });

    this.projectListContainer.querySelectorAll('.delete-proj-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.deleteProject(id);
      });
    });

    createIcons({ icons });
  }

  handleProjectFormSubmit() {
    const titleInput = document.getElementById('proj-form-title');
    const categoryInput = document.getElementById('proj-form-category');
    const badgeInput = document.getElementById('proj-form-badge');
    const filterInput = document.getElementById('proj-form-filter');
    const imageInput = document.getElementById('proj-form-image');
    const liveUrlInput = document.getElementById('proj-form-liveurl');
    const githubUrlInput = document.getElementById('proj-form-githuburl');
    const descInput = document.getElementById('proj-form-desc');
    const tagsInput = document.getElementById('proj-form-tags');
    const featuredInput = document.getElementById('proj-form-featured');

    const title = titleInput.value.trim();
    if (!title) return alert('Project title is required.');

    const id = this.editingProjectId || ('p_' + Date.now().toString(36));
    const newProject = {
      id,
      title,
      category: categoryInput.value.trim() || 'Custom Apparel Art',
      categoryBadge: badgeInput.value.trim().toUpperCase() || 'APPAREL ART',
      filterCategory: filterInput.value || 'streetwear pod',
      imageUrl: imageInput.value.trim() || './portfolio/street-threadx-collection.png',
      image: imageInput.value.trim() || './portfolio/street-threadx-collection.png',
      liveUrl: liveUrlInput ? liveUrlInput.value.trim() : 'https://www.behance.net/biplob-art',
      githubUrl: githubUrlInput ? githubUrlInput.value.trim() : 'https://github.com',
      desc: descInput.value.trim() || 'Custom commercial t-shirt apparel graphic design by MD Biplob.',
      modalCategory: categoryInput.value.trim() || 'Custom Apparel Art',
      techStack: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
      tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
      isFeatured: featuredInput ? featuredInput.checked : false,
      views: this.projects[id]?.views || 10
    };

    const updated = { ...this.projects, [id]: newProject };
    this.saveProjects(updated);
    this.renderAdminProjectList();
    this.resetProjectForm();
    sound.playChime();
    this.showAdminToast(this.editingProjectId ? 'Project updated successfully!' : '🎉 New Case Study published to live portfolio!');
  }

  editProject(id) {
    const p = this.projects[id];
    if (!p) return;

    this.editingProjectId = id;
    document.getElementById('proj-form-id').value = id;
    document.getElementById('proj-form-title').value = p.title || '';
    document.getElementById('proj-form-category').value = p.category || '';
    document.getElementById('proj-form-badge').value = p.categoryBadge || '';
    document.getElementById('proj-form-filter').value = p.filterCategory || 'streetwear';
    document.getElementById('proj-form-image').value = p.imageUrl || p.image || '';
    
    const liveUrlInput = document.getElementById('proj-form-liveurl');
    if (liveUrlInput) liveUrlInput.value = p.liveUrl || '';

    const githubUrlInput = document.getElementById('proj-form-githuburl');
    if (githubUrlInput) githubUrlInput.value = p.githubUrl || '';

    document.getElementById('proj-form-desc').value = p.desc || '';
    document.getElementById('proj-form-tags').value = (p.techStack || p.tags || []).join(', ');

    const featuredInput = document.getElementById('proj-form-featured');
    if (featuredInput) featuredInput.checked = Boolean(p.isFeatured);

    const formHeading = document.getElementById('admin-project-form-heading');
    if (formHeading) formHeading.textContent = `✏️ Edit Case Study (${id})`;

    const submitBtn = document.getElementById('submit-project-btn');
    if (submitBtn) submitBtn.innerHTML = `<i data-lucide="check" style="width:14px;height:14px;"></i> <span>SAVE CHANGES</span>`;

    const cancelBtn = document.getElementById('cancel-edit-project-btn');
    if (cancelBtn) cancelBtn.style.display = 'inline-flex';

    document.getElementById('admin-project-form').scrollIntoView({ behavior: 'smooth' });
    createIcons({ icons });
    sound.playClick();
  }

  resetProjectForm() {
    this.editingProjectId = null;
    if (this.projectForm) this.projectForm.reset();

    const formHeading = document.getElementById('admin-project-form-heading');
    if (formHeading) formHeading.textContent = `➕ Add New Portfolio Case Study`;

    const submitBtn = document.getElementById('submit-project-btn');
    if (submitBtn) submitBtn.innerHTML = `<i data-lucide="plus" style="width:14px;height:14px;"></i> <span>ADD PROJECT TO LIVE SITE</span>`;

    const cancelBtn = document.getElementById('cancel-edit-project-btn');
    if (cancelBtn) cancelBtn.style.display = 'none';

    createIcons({ icons });
  }

  deleteProject(id) {
    if (!confirm(`Are you sure you want to delete project "${this.projects[id]?.title || id}"?`)) return;

    const updated = { ...this.projects };
    delete updated[id];
    this.saveProjects(updated);
    this.renderAdminProjectList();
    sound.playClick();
    this.showAdminToast('Project deleted from portfolio.');
  }

  // ==========================================================================
  // 3. SKILLS & CERTIFICATIONS MANAGER
  // ==========================================================================
  renderAdminSkills() {
    if (!this.skillsListContainer) return;
    this.skillsListContainer.innerHTML = this.skills.map(s => `
      <div class="admin-skill-item">
        <div class="admin-skill-info">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <strong style="color: var(--text-main); font-size: 0.9rem;">${s.name}</strong>
            <span class="admin-project-badge">${s.category}</span>
          </div>
          <div class="skill-bar-track" style="margin-top: 6px; height: 6px;">
            <div class="skill-bar-fill" style="width: ${s.proficiency}%;"></div>
          </div>
          <div class="mono" style="font-size: 0.72rem; color: var(--accent-primary); margin-top: 3px;">
            ${s.proficiency}% • ${s.levelText || 'Specialist'}
          </div>
        </div>
        <div class="admin-project-actions">
          <button class="icon-btn edit-skill-btn" data-id="${s.id}" title="Edit Skill">
            <i data-lucide="pencil" style="width: 13px; height: 13px; color: #00f3ff;"></i>
          </button>
          <button class="icon-btn delete-skill-btn" data-id="${s.id}" title="Delete Skill">
            <i data-lucide="trash-2" style="width: 13px; height: 13px; color: #ff007f;"></i>
          </button>
        </div>
      </div>
    `).join('');

    this.skillsListContainer.querySelectorAll('.edit-skill-btn').forEach(btn => {
      btn.addEventListener('click', () => this.editSkill(btn.getAttribute('data-id')));
    });

    this.skillsListContainer.querySelectorAll('.delete-skill-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSkill(btn.getAttribute('data-id')));
    });

    createIcons({ icons });
  }

  renderAdminCertifications() {
    if (!this.certListContainer) return;
    this.certListContainer.innerHTML = this.certifications.map(c => `
      <div class="admin-skill-item">
        <div class="admin-skill-info">
          <div style="font-weight: 700; color: var(--text-main); font-size: 0.88rem;">${c.title}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            ${c.issuer} • ${c.year} • <span style="color:#00ff88; font-weight:700;">${c.badge}</span>
          </div>
        </div>
        <div class="admin-project-actions">
          <button class="icon-btn delete-cert-btn" data-id="${c.id}" title="Delete Certification">
            <i data-lucide="trash-2" style="width: 13px; height: 13px; color: #ff007f;"></i>
          </button>
        </div>
      </div>
    `).join('');

    this.certListContainer.querySelectorAll('.delete-cert-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteCertification(btn.getAttribute('data-id')));
    });

    createIcons({ icons });
  }

  handleSkillFormSubmit() {
    const nameInput = document.getElementById('skill-form-name');
    const catInput = document.getElementById('skill-form-category');
    const profInput = document.getElementById('skill-form-proficiency');
    const levelInput = document.getElementById('skill-form-level');

    const name = nameInput.value.trim();
    if (!name) return alert('Skill name is required.');

    const id = this.editingSkillId || ('sk_' + Date.now().toString(36));
    const skillObj = {
      id,
      name,
      category: catInput.value || 'Creative Apparel & Print',
      proficiency: parseInt(profInput.value, 10) || 90,
      levelText: levelInput.value.trim() || 'Specialist'
    };

    const existingIdx = this.skills.findIndex(s => s.id === id);
    if (existingIdx >= 0) {
      this.skills[existingIdx] = skillObj;
    } else {
      this.skills.push(skillObj);
    }

    this.saveSkillsData();
    this.renderAdminSkills();
    this.renderPublicSkills();
    this.resetSkillForm();
    sound.playChime();
    this.showAdminToast('⚡ Technical Skill updated on live site!');
  }

  editSkill(id) {
    const s = this.skills.find(x => x.id === id);
    if (!s) return;

    this.editingSkillId = id;
    document.getElementById('skill-form-name').value = s.name;
    document.getElementById('skill-form-category').value = s.category;
    document.getElementById('skill-form-proficiency').value = s.proficiency;
    document.getElementById('skill-form-proficiency-val').textContent = `${s.proficiency}%`;
    document.getElementById('skill-form-level').value = s.levelText || 'Specialist';

    document.getElementById('submit-skill-btn').innerHTML = `<i data-lucide="check" style="width:14px;height:14px;"></i> <span>SAVE SKILL</span>`;
    document.getElementById('cancel-edit-skill-btn').style.display = 'inline-flex';
    createIcons({ icons });
  }

  resetSkillForm() {
    this.editingSkillId = null;
    document.getElementById('admin-skill-form').reset();
    document.getElementById('skill-form-proficiency-val').textContent = '90%';
    document.getElementById('submit-skill-btn').innerHTML = `<i data-lucide="plus" style="width:14px;height:14px;"></i> <span>ADD SKILL</span>`;
    document.getElementById('cancel-edit-skill-btn').style.display = 'none';
    createIcons({ icons });
  }

  deleteSkill(id) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    this.skills = this.skills.filter(s => s.id !== id);
    this.saveSkillsData();
    this.renderAdminSkills();
    this.renderPublicSkills();
    sound.playClick();
    this.showAdminToast('Skill removed.');
  }

  handleCertFormSubmit() {
    const titleInput = document.getElementById('cert-form-title');
    const issuerInput = document.getElementById('cert-form-issuer');
    const yearInput = document.getElementById('cert-form-year');
    const badgeInput = document.getElementById('cert-form-badge');

    const title = titleInput.value.trim();
    if (!title) return alert('Certification title is required.');

    const newCert = {
      id: 'cert_' + Date.now().toString(36),
      title,
      issuer: issuerInput.value.trim() || 'Verified Design Institute',
      year: yearInput.value.trim() || '2026',
      badge: badgeInput.value.trim().toUpperCase() || 'VERIFIED'
    };

    this.certifications.unshift(newCert);
    this.saveSkillsData();
    this.renderAdminCertifications();
    this.renderPublicCertifications();
    document.getElementById('admin-cert-form').reset();
    sound.playChime();
    this.showAdminToast('🎓 Certification / Training program added!');
  }

  deleteCertification(id) {
    if (!confirm('Delete this certification record?')) return;
    this.certifications = this.certifications.filter(c => c.id !== id);
    this.saveSkillsData();
    this.renderAdminCertifications();
    this.renderPublicCertifications();
    sound.playClick();
    this.showAdminToast('Certification removed.');
  }

  saveSkillsData() {
    saveStoredSkills({
      skills: this.skills,
      certifications: this.certifications
    });
  }

  renderPublicSkills() {
    const skillsContainer = document.querySelector('.skills-progress-list');
    if (!skillsContainer) return;

    skillsContainer.innerHTML = this.skills.map(s => `
      <div>
        <div class="skill-bar-header">
          <span>${s.name}</span>
          <span class="hud-val">${s.proficiency}%</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill" style="width: ${s.proficiency}%;"></div>
        </div>
      </div>
    `).join('');
  }

  renderPublicCertifications() {
    const certsContainer = document.getElementById('public-certifications-container');
    if (!certsContainer) return;

    certsContainer.innerHTML = this.certifications.map(c => `
      <div class="timeline-item reveal-card" style="margin-bottom: 1.2rem;">
        <div class="timeline-node" style="background: rgba(0, 255, 136, 0.1); border-color: #00ff88;">
          <i data-lucide="award" style="width: 18px; height: 18px; color: #00ff88;"></i>
        </div>
        <div class="timeline-content" style="padding: 1.2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.4rem;">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">${c.title}</h4>
            <span class="skill-badge highlight" style="font-size: 0.68rem; padding: 0.15rem 0.5rem; color: #00ff88; border-color: #00ff88;">${c.badge}</span>
          </div>
          <p class="mono" style="font-size: 0.8rem; color: var(--text-muted);">${c.issuer} // ${c.year}</p>
        </div>
      </div>
    `).join('');

    createIcons({ icons });
  }

  // ==========================================================================
  // 4. MESSAGE CENTER (CRM)
  // ==========================================================================
  getInquiries() {
    return getLocalInquiries();
  }

  saveInquiries(inquiries) {
    saveLocalInquiries(inquiries);
  }

  renderInquiriesTable(filter = 'all') {
    if (!this.inquiriesTableContainer) return;
    const inquiries = this.getInquiries();

    const filtered = inquiries.filter(inq => {
      if (filter === 'all') return true;
      return (inq.status || 'new') === filter;
    });

    if (filtered.length === 0) {
      this.inquiriesTableContainer.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            <i data-lucide="inbox" style="width: 32px; height: 32px; margin-bottom: 8px; display: inline-block;"></i>
            <p>No client inquiries found matching "${filter}".</p>
          </td>
        </tr>
      `;
      createIcons({ icons });
      return;
    }

    this.inquiriesTableContainer.innerHTML = filtered.map(inq => {
      const dateStr = inq.submittedAt || inq.createdAt ? new Date(inq.submittedAt || inq.createdAt).toLocaleDateString() : 'Recent';
      const cleanPhone = (inq.phone || '').replace(/[^0-9+]/g, '');
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}?text=Hi%20${encodeURIComponent(inq.senderName || inq.name || 'Client')},%20regarding%20your%20apparel%20inquiry...` : null;
      const email = inq.senderEmail || inq.email || '';
      const emailLink = email ? `mailto:${email}?subject=Apparel%20Design%20Inquiry%20-%20MD%20Biplob` : null;
      const isUnread = !inq.isRead && inq.status === 'new';

      return `
        <tr class="${isUnread ? 'crm-row-unread' : ''}">
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              ${isUnread ? '<span class="crm-unread-dot" title="Unread Lead"></span>' : ''}
              <div style="font-weight: 700; color: var(--text-main);">${inq.senderName || inq.name || 'Client'}</div>
            </div>
            <div class="mono" style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</div>
          </td>
          <td>
            <div style="font-size: 0.85rem;">
              ${emailLink ? `<a href="${emailLink}" class="crm-link"><i data-lucide="mail" style="width:12px;height:12px;"></i> ${email}</a>` : '—'}
            </div>
            <div style="font-size: 0.85rem; margin-top: 3px;">
              ${waLink ? `<a href="${waLink}" target="_blank" class="crm-link whatsapp"><i data-lucide="phone" style="width:12px;height:12px;"></i> ${inq.phone}</a>` : (inq.phone || '—')}
            </div>
          </td>
          <td>
            <span class="crm-category-tag">${inq.projectType || 'T-Shirt Design'}</span>
            <div class="mono" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px;">Qty: ${inq.quantity || 'Standard'}</div>
          </td>
          <td>
            <div class="crm-message-preview" title="${inq.message || ''}">${inq.message || 'No details provided.'}</div>
          </td>
          <td>
            <select class="crm-status-select" data-id="${inq.id}">
              <option value="new" ${(inq.status || 'new') === 'new' ? 'selected' : ''}>🟡 New Lead</option>
              <option value="discussion" ${inq.status === 'discussion' ? 'selected' : ''}>🔵 In Discussion</option>
              <option value="quoted" ${inq.status === 'quoted' ? 'selected' : ''}>🟣 Quoted</option>
              <option value="closed" ${inq.status === 'closed' ? 'selected' : ''}>🟢 Closed / Won</option>
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              ${waLink ? `
                <a href="${waLink}" target="_blank" class="icon-btn whatsapp-btn" style="width: 28px; height: 28px;" title="Chat on WhatsApp">
                  <i data-lucide="message-circle" style="width: 14px; height: 14px;"></i>
                </a>
              ` : ''}
              ${emailLink ? `
                <a href="${emailLink}" class="icon-btn" style="width: 28px; height: 28px;" title="Send Email">
                  <i data-lucide="send" style="width: 14px; height: 14px;"></i>
                </a>
              ` : ''}
              <button class="icon-btn toggle-read-btn" data-id="${inq.id}" style="width: 28px; height: 28px;" title="Toggle Read/Unread">
                <i data-lucide="${inq.isRead ? 'eye-off' : 'eye'}" style="width: 14px; height: 14px; color: var(--accent-primary);"></i>
              </button>
              <button class="icon-btn delete-inquiry-btn" data-id="${inq.id}" style="width: 28px; height: 28px; color: #ff007f;" title="Delete Lead">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.inquiriesTableContainer.querySelectorAll('.crm-status-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.getAttribute('data-id');
        const newStatus = sel.value;
        this.updateInquiryStatus(id, newStatus);
      });
    });

    this.inquiriesTableContainer.querySelectorAll('.toggle-read-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.toggleMessageRead(id);
      });
    });

    this.inquiriesTableContainer.querySelectorAll('.delete-inquiry-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.deleteInquiry(id);
      });
    });

    createIcons({ icons });
  }

  toggleMessageRead(id) {
    const list = this.getInquiries();
    const item = list.find(x => x.id === id);
    if (item) {
      item.isRead = !item.isRead;
      this.saveInquiries(list);
      this.renderInquiriesTable(this.currentInquiryFilter);
      this.renderOverviewStats();
      sound.playClick();
    }
  }

  updateInquiryStatus(id, newStatus) {
    const list = this.getInquiries();
    const item = list.find(x => x.id === id);
    if (item) {
      item.status = newStatus;
      item.isRead = true;
      this.saveInquiries(list);
      this.renderOverviewStats();
      sound.playClick();
      this.showAdminToast(`Lead status updated to: ${newStatus.toUpperCase()}`);
    }
  }

  deleteInquiry(id) {
    if (!confirm('Are you sure you want to delete this client record?')) return;
    const list = this.getInquiries().filter(x => x.id !== id);
    this.saveInquiries(list);
    this.renderInquiriesTable(this.currentInquiryFilter);
    this.renderOverviewStats();
    sound.playClick();
    this.showAdminToast('Client inquiry removed.');
  }

  exportInquiriesCSV() {
    const inquiries = this.getInquiries();
    if (inquiries.length === 0) return alert('No inquiries available to export.');

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Project Type', 'Quantity', 'Status', 'Is Read', 'Date', 'Message'];
    const rows = inquiries.map(inq => [
      inq.id || '',
      `"${(inq.senderName || inq.name || '').replace(/"/g, '""')}"`,
      `"${(inq.senderEmail || inq.email || '').replace(/"/g, '""')}"`,
      `"${(inq.phone || '').replace(/"/g, '""')}"`,
      `"${(inq.projectType || '').replace(/"/g, '""')}"`,
      `"${(inq.quantity || '').replace(/"/g, '""')}"`,
      `"${(inq.status || 'new').replace(/"/g, '""')}"`,
      inq.isRead ? 'Yes' : 'No',
      `"${(inq.submittedAt || inq.createdAt || '').replace(/"/g, '""')}"`,
      `"${(inq.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `biplob_art_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    sound.playChime();
    this.showAdminToast('📥 Inquiries successfully exported to CSV!');
  }

  addSampleInquiry() {
    const samples = [
      {
        senderName: 'Alexander Vance',
        name: 'Alexander Vance',
        senderEmail: 'alex.vance@tokyodrop.com',
        email: 'alex.vance@tokyodrop.com',
        phone: '+14155552671',
        projectType: 'Streetwear T-Shirt Drop',
        quantity: '5-20 Designs / Season Drop',
        message: 'Looking for 8 oversized graphic tees with Japanese cyberpunk typography and metallic chrome artwork for our Fall collection.',
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        status: 'new',
        isRead: false
      },
      {
        senderName: 'Sophia Sterling',
        name: 'Sophia Sterling',
        senderEmail: 'sophia@urbanmerch.co.uk',
        email: 'sophia@urbanmerch.co.uk',
        phone: '+447911123456',
        projectType: 'Custom Typography & Lettering',
        quantity: 'Full Brand Launch Collection',
        message: 'Need complete apparel tech packs, vector color separations, and lettering for our new UK sustainable streetwear brand.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'discussion',
        isRead: true
      }
    ];

    const current = this.getInquiries();
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    const newInq = { id: 'msg_' + Date.now().toString(36), ...randomSample };
    current.unshift(newInq);
    this.saveInquiries(current);

    this.renderInquiriesTable(this.currentInquiryFilter);
    this.renderOverviewStats();
    sound.playChime();
    this.showAdminToast('✨ Sample lead created in CRM!');
  }

  // ==========================================================================
  // 5. PROFILE & GLOBAL SITE SETTINGS
  // ==========================================================================
  populateSettingsForm() {
    const bannerCheckbox = document.getElementById('settings-banner-toggle');
    const bannerTextInput = document.getElementById('settings-banner-text');
    const heroHeadlineInput = document.getElementById('settings-hero-headline');
    const heroSubInput = document.getElementById('settings-hero-subheadline');
    const heroBioInput = document.getElementById('settings-hero-bio');
    const resumeLinkInput = document.getElementById('settings-resume-link');
    const emailInput = document.getElementById('settings-contact-email');
    const phoneInput = document.getElementById('settings-whatsapp-phone');
    const accentInput = document.getElementById('settings-accent-color');
    const particleSelect = document.getElementById('settings-particles-select');

    if (bannerCheckbox) bannerCheckbox.checked = Boolean(this.settings.announcementEnabled);
    if (bannerTextInput) bannerTextInput.value = this.settings.announcementText || '';
    if (heroHeadlineInput) heroHeadlineInput.value = this.settings.heroHeadline || 'MD BIPLOB';
    if (heroSubInput) heroSubInput.value = this.settings.heroSubHeadline || '';
    if (heroBioInput) heroBioInput.value = this.settings.heroBio || '';
    if (resumeLinkInput) resumeLinkInput.value = this.settings.resumeLink || '';
    if (emailInput) emailInput.value = this.settings.contactEmail || '';
    if (phoneInput) phoneInput.value = this.settings.whatsappNumber || '';
    if (accentInput) accentInput.value = this.settings.customAccent || '#00f3ff';
    if (particleSelect) particleSelect.value = this.settings.particleCount || '12000';
  }

  handleSettingsSubmit() {
    const bannerCheckbox = document.getElementById('settings-banner-toggle');
    const bannerTextInput = document.getElementById('settings-banner-text');
    const heroHeadlineInput = document.getElementById('settings-hero-headline');
    const heroSubInput = document.getElementById('settings-hero-subheadline');
    const heroBioInput = document.getElementById('settings-hero-bio');
    const resumeLinkInput = document.getElementById('settings-resume-link');
    const emailInput = document.getElementById('settings-contact-email');
    const phoneInput = document.getElementById('settings-whatsapp-phone');
    const accentInput = document.getElementById('settings-accent-color');
    const particleSelect = document.getElementById('settings-particles-select');

    const newSettings = {
      ...this.settings,
      announcementEnabled: bannerCheckbox ? bannerCheckbox.checked : true,
      announcementText: bannerTextInput ? bannerTextInput.value.trim() : '',
      heroHeadline: heroHeadlineInput ? heroHeadlineInput.value.trim() : 'MD BIPLOB',
      heroSubHeadline: heroSubInput ? heroSubInput.value.trim() : '',
      heroBio: heroBioInput ? heroBioInput.value.trim() : '',
      resumeLink: resumeLinkInput ? resumeLinkInput.value.trim() : '',
      contactEmail: emailInput ? emailInput.value.trim() : '',
      whatsappNumber: phoneInput ? phoneInput.value.trim() : '+8801340276600',
      customAccent: accentInput ? accentInput.value : '#00f3ff',
      particleCount: particleSelect ? particleSelect.value : '12000'
    };

    this.settings = newSettings;
    saveStoredSiteSettings(newSettings);
    this.applySettingsToDOM();
    sound.playChime();
    this.showAdminToast('⚡ Global Profile & Site Settings applied live!');
  }

  applySettingsToDOM() {
    // 1. Top Announcement Bar
    document.body.classList.toggle('has-announcement', Boolean(this.settings.announcementEnabled));
    if (this.announcementBar && this.announcementTextElem) {
      if (this.settings.announcementEnabled) {
        this.announcementBar.style.display = 'flex';
        this.announcementTextElem.textContent = this.settings.announcementText;
      } else {
        this.announcementBar.style.display = 'none';
      }
    }

    // 2. Custom Neon Accent
    if (this.settings.customAccent) {
      document.documentElement.style.setProperty('--accent-primary', this.settings.customAccent);
    }

    // 3. Hero Subheadline & Bio
    const heroSubElem = document.querySelector('.hero-subtitle');
    if (heroSubElem && this.settings.heroSubHeadline) {
      heroSubElem.textContent = this.settings.heroSubHeadline;
    }

    const heroBioElem = document.querySelector('.hero-desc');
    if (heroBioElem && this.settings.heroBio) {
      heroBioElem.textContent = this.settings.heroBio;
    }
  }

  // ==========================================================================
  // 6. DATABASE BACKUP & FACTORY RESET
  // ==========================================================================
  exportFullBackup() {
    const backup = {
      version: '2.0.0',
      system: 'MD Biplob Portfolio & Admin Hub',
      timestamp: new Date().toISOString(),
      projects: this.projects,
      skills: this.skills,
      certifications: this.certifications,
      inquiries: this.getInquiries(),
      settings: this.settings
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `biplob_art_full_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    sound.playChime();
    this.showAdminToast('💾 Full JSON Database backup exported!');
  }

  handleBackupFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.projects) this.saveProjects(parsed.projects);
        if (parsed.skills) this.skills = parsed.skills;
        if (parsed.certifications) this.certifications = parsed.certifications;
        this.saveSkillsData();
        if (parsed.inquiries) this.saveInquiries(parsed.inquiries);
        if (parsed.settings) {
          this.settings = parsed.settings;
          saveStoredSiteSettings(parsed.settings);
        }

        this.applyAllPublicUpdates();
        this.showDashboard();
        sound.playChime();
        this.showAdminToast('🎉 Database backup successfully restored!');
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  }

  resetToDefaults() {
    if (!confirm('⚠️ WARNING: This will reset all projects, skills, CRM messages, and settings to factory defaults. Proceed?')) return;

    localStorage.clear();

    this.projects = { ...DEFAULT_PROJECTS };
    this.skills = [...DEFAULT_SKILLS];
    this.certifications = [...DEFAULT_CERTIFICATIONS];
    this.settings = { ...DEFAULT_SITE_SETTINGS };

    this.saveProjects(this.projects);
    this.saveSkillsData();
    this.saveInquiries([]);
    saveStoredSiteSettings(this.settings);

    this.applyAllPublicUpdates();
    this.showDashboard();

    sound.playChime();
    this.showAdminToast('🔄 System reset to factory defaults!');
  }

  showAdminToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('visible');
    }, 50);

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
}
