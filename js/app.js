// ============================================================
// CallIQ — Main App Controller
// ============================================================

const App = {
    currentPage: 'dashboard',

    init() {
        this.setupNavigation();
        this.setupModal();
        this.navigateTo('dashboard');
    },

    setupNavigation() {
        // Desktop nav clicks
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(item.dataset.page);
            });
        });

        // Mobile menu toggle
        const menuBtn = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
        }

        // Close sidebar when clicking outside on mobile
        document.getElementById('main-content').addEventListener('click', () => {
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    },

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        // Show target page
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) pageEl.classList.add('active');

        // Activate nav item
        const navEl = document.getElementById(`nav-${page}`);
        if (navEl) navEl.classList.add('active');

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');

        this.currentPage = page;

        // Render page content
        switch (page) {
            case 'dashboard': renderDashboardPage(); break;
            case 'calls': renderCallsPage(); break;
            case 'agents': renderAgentsPage(); break;
            case 'leads': renderLeadsPage(); break;
            case 'audit': renderAuditPage(); break;
            case 'compliance': renderCompliancePage(); break;
            case 'settings': renderSettingsPage(); break;
        }

        // Scroll to top
        window.scrollTo(0, 0);
    },

    setupModal() {
        const overlay = document.getElementById('audit-modal');
        const closeBtn = document.getElementById('modal-close-btn');

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });

        // Close on X button
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    },

    showAuditModal(auditId) {
        const audits = DB.getAudits();
        const audit = audits.find(a => a.id === auditId);
        if (!audit) { Toast.show('Audit not found', 'error'); return; }

        renderAuditModal(audit);
        const overlay = document.getElementById('audit-modal');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        document.getElementById('audit-modal').classList.add('hidden');
        document.body.style.overflow = '';
    }
};

// ─── Toast Notification System ───
const Toast = {
    show(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        const icons = {
            success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// ─── Boot ───
document.addEventListener('DOMContentLoaded', () => App.init());
