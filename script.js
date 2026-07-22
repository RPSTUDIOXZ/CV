// ============================================
// EMAILJS CONFIGURATION
// ============================================
const EMAILJS_CONFIG = {
    userID: 'fv7bcFtFncjEC38NP',
    serviceID: 'service_b0u7ona',
    templateID: 'template_o49zurn'
};

// Initialize EmailJS
(function() {
    emailjs.init(EMAILJS_CONFIG.userID);
    console.log('✅ EmailJS initialized successfully!');
})();

// ============================================
// DOM Elements
// ============================================
const DOM = {
    fullName: document.getElementById('fullName'),
    jobTitle: document.getElementById('jobTitle'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    address: document.getElementById('address'),
    education: document.getElementById('education'),
    experience: document.getElementById('experience'),
    skills: document.getElementById('skills'),
    certifications: document.getElementById('certifications'),
    portfolio: document.getElementById('portfolio'),
    
    cvName: document.getElementById('cvName'),
    cvJobTitle: document.getElementById('cvJobTitle'),
    cvEmail: document.getElementById('cvEmail'),
    cvPhone: document.getElementById('cvPhone'),
    cvAddress: document.getElementById('cvAddress'),
    cvEducation: document.getElementById('cvEducation'),
    cvExperience: document.getElementById('cvExperience'),
    cvSkills: document.getElementById('cvSkills'),
    cvCertifications: document.getElementById('cvCertifications'),
    cvPortfolio: document.getElementById('cvPortfolio'),
    cvPhoto: document.getElementById('cvPhoto'),
    photoPreview: document.getElementById('photoPreview'),
    cvPreview: document.getElementById('cvPreview')
};

let currentTemplate = 'modern';
let photoData = null;
let generatedOTP = null;
let otpTimer = null;
let loggedInUser = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadFromLocalStorage();
    
    // Check if user was logged in
    const savedUser = localStorage.getItem('cv_user');
    if (savedUser) {
        loggedInUser = savedUser;
        document.getElementById('userStatus').textContent = '👤 ' + loggedInUser;
        document.getElementById('loginBtn').innerHTML = '<i class="fas fa-check-circle"></i>';
    }
    
    console.log('🚀 CV Builder Loaded Successfully!');
});

// ============================================
// LOGIN SYSTEM - Send OTP
// ============================================
function sendOTP(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const userName = document.getElementById('fullName').value || 'User';
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Generate OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Show loading
    const sendBtn = document.getElementById('sendOtpBtn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    sendBtn.disabled = true;
    
    // Send OTP via EmailJS
    const templateParams = {
        to_email: email,
        to_name: userName,
        otp_code: generatedOTP,
        subject: '🔐 Your CV Builder OTP Code'
    };
    
    emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.templateID,
        templateParams
    )
    .then(function(response) {
        console.log('✅ OTP Sent Successfully:', response);
        
        document.getElementById('loginStatus').innerHTML = 
            '<div class="success">✅ OTP sent successfully to your email!</div>';
        document.getElementById('otpSection').style.display = 'block';
        document.getElementById('loginEmail').disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        sendBtn.style.background = '#28a745';
        
        // Start timer
        startOTPTimer();
        
        // Focus OTP input
        document.getElementById('otpInput').focus();
    })
    .catch(function(error) {
        console.error('❌ EmailJS Error:', error);
        document.getElementById('loginStatus').innerHTML = 
            '<div class="error">❌ Failed to send OTP. Please check your email and try again.</div>';
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
    });
}

// ============================================
// OTP TIMER
// ============================================
function startOTPTimer() {
    if (otpTimer) {
        clearInterval(otpTimer);
    }
    
    let timeLeft = 300; // 5 minutes
    const timerDisplay = document.getElementById('otpTimerDisplay');
    timerDisplay.style.display = 'block';
    
    otpTimer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `⏰ ${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
        
        if (timeLeft <= 0) {
            clearInterval(otpTimer);
            generatedOTP = null;
            timerDisplay.textContent = '⏰ OTP expired. Please request a new one.';
            timerDisplay.style.color = '#dc3545';
            document.getElementById('resendBtn').style.display = 'block';
        }
    }, 1000);
}

// ============================================
// VERIFY OTP
// ============================================
function verifyOTP() {
    const enteredOTP = document.getElementById('otpInput').value;
    const email = document.getElementById('loginEmail').value;
    
    if (!enteredOTP || enteredOTP.length !== 6) {
        document.getElementById('loginStatus').innerHTML = 
            '<div class="error">⚠️ Please enter a valid 6-digit OTP</div>';
        return;
    }
    
    if (enteredOTP === generatedOTP) {
        // Login successful
        loggedInUser = email;
        localStorage.setItem('cv_user', email);
        
        document.getElementById('loginStatus').innerHTML = 
            '<div class="success">✅ Login successful! Welcome ' + email + '</div>';
        document.getElementById('userStatus').textContent = '👤 ' + email;
        document.getElementById('loginBtn').innerHTML = '<i class="fas fa-check-circle"></i>';
        
        // Clear timer
        if (otpTimer) {
            clearInterval(otpTimer);
        }
        
        setTimeout(() => {
            closeLogin();
            generateCV();
            saveToLocalStorage();
        }, 1500);
        
    } else {
        document.getElementById('loginStatus').innerHTML = 
            '<div class="error">❌ Invalid OTP. Please try again.</div>';
        document.getElementById('otpInput').value = '';
        document.getElementById('otpInput').focus();
    }
}

// ============================================
// RESEND OTP
// ============================================
function resendOTP() {
    const email = document.getElementById('loginEmail').value;
    const userName = document.getElementById('fullName').value || 'User';
    
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    // Generate new OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    const resendBtn = document.getElementById('resendBtn');
    resendBtn.disabled = true;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    const templateParams = {
        to_email: email,
        to_name: userName,
        otp_code: generatedOTP,
        subject: '🔐 New OTP Code for CV Builder'
    };
    
    emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.templateID,
        templateParams
    )
    .then(function(response) {
        console.log('✅ New OTP Sent:', response);
        document.getElementById('loginStatus').innerHTML = 
            '<div class="success">✅ New OTP sent successfully!</div>';
        resendBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        resendBtn.style.background = '#28a745';
        startOTPTimer();
        document.getElementById('otpInput').focus();
        
        setTimeout(() => {
            resendBtn.disabled = false;
            resendBtn.innerHTML = '<i class="fas fa-redo"></i> Resend';
            resendBtn.style.background = '';
        }, 3000);
    })
    .catch(function(error) {
        console.error('❌ Resend Error:', error);
        document.getElementById('loginStatus').innerHTML = 
            '<div class="error">❌ Failed to resend OTP. Please try again.</div>';
        resendBtn.disabled = false;
        resendBtn.innerHTML = '<i class="fas fa-redo"></i> Resend';
    });
}

// ============================================
// SHOW/HIDE LOGIN MODAL
// ============================================
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('loginStatus').innerHTML = '';
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('loginEmail').disabled = false;
    document.getElementById('loginEmail').value = '';
    document.getElementById('otpInput').value = '';
    
    const sendBtn = document.getElementById('sendOtpBtn');
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
    sendBtn.disabled = false;
    sendBtn.style.background = '';
    
    document.getElementById('otpTimerDisplay').style.display = 'none';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
    if (otpTimer) {
        clearInterval(otpTimer);
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLogin();
    }
};

// ============================================
// PROFILE PHOTO UPLOAD
// ============================================
function uploadPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoData = e.target.result;
            document.getElementById('photoPreview').innerHTML = `<img src="${photoData}" alt="Profile">`;
            document.getElementById('cvPhoto').innerHTML = `<img src="${photoData}" alt="Profile">`;
        };
        reader.readAsDataURL(file);
    }
}

// ============================================
// TEMPLATE CHANGE
// ============================================
function changeTemplate(template) {
    currentTemplate = template;
    
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.template === template) {
            btn.classList.add('active');
        }
    });
    
    document.getElementById('cvPreview').className = 'cv-preview ' + template + '-template';
}

// ============================================
// GENERATE CV
// ============================================
function generateCV() {
    const name = DOM.fullName.value || 'Your Name';
    const jobTitle = DOM.jobTitle.value || 'Job Title';
    const email = DOM.email.value || 'Email';
    const phone = DOM.phone.value || 'Phone';
    const address = DOM.address.value || 'Address';
    const education = DOM.education.value || 'Education details appear here';
    const experience = DOM.experience.value || 'Work experience appears here';
    const skills = DOM.skills.value || 'Skills';
    const certifications = DOM.certifications.value || 'Certifications appear here';
    const portfolio = DOM.portfolio.value || 'https://yourportfolio.com';
    
    DOM.cvName.textContent = name;
    DOM.cvJobTitle.textContent = jobTitle;
    DOM.cvEmail.textContent = '📧 ' + email;
    DOM.cvPhone.textContent = '📞 ' + phone;
    DOM.cvAddress.textContent = '📍 ' + address;
    DOM.cvEducation.textContent = education;
    DOM.cvExperience.textContent = experience;
    
    // Skills as tags
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
    if (skillsArray.length > 0 && skillsArray[0] !== 'Skills') {
        DOM.cvSkills.innerHTML = skillsArray.map(s => 
            `<span class="skill-tag">${s}</span>`
        ).join('');
    } else {
        DOM.cvSkills.innerHTML = '<span class="skill-tag">Skill</span>';
    }
    
    DOM.cvCertifications.textContent = certifications;
    DOM.cvPortfolio.textContent = portfolio;
    
    // Scroll to preview
    document.querySelector('.preview-section').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// PDF DOWNLOAD
// ============================================
function downloadPDF() {
    const element = document.getElementById('cvPreview');
    const btn = document.querySelector('.btn-download');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    btn.disabled = true;
    
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: 'My_CV.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(function() {
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

// ============================================
// PRINT CV
// ============================================
function printCV() {
    const previewContent = document.getElementById('cvPreview').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>CV - Print</title>
                <style>
                    body { font-family: 'Poppins', Arial, sans-serif; padding: 40px; }
                    .cv-preview { max-width: 800px; margin: 0 auto; }
                    .cv-header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 25px; }
                    .cv-profile { display: flex; align-items: center; gap: 25px; }
                    .cv-photo { width: 100px; height: 100px; border-radius: 50%; overflow: hidden; }
                    .cv-photo img { width: 100%; height: 100%; object-fit: cover; }
                    .cv-section { margin: 20px 0; }
                    .cv-section h3 { color: #667eea; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
                    .skills-tags { display: flex; flex-wrap: wrap; gap: 8px; }
                    .skill-tag { background: #f0f2f5; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; }
                    @media print {
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="cv-preview">
                    ${previewContent}
                </div>
                <script>
                    window.onload = function() { window.print(); }
                <\/script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// ============================================
// SHARE CV
// ============================================
function shareCV() {
    const url = window.location.href;
    const text = 'Check out my professional CV!';
    
    if (navigator.share) {
        navigator.share({
            title: 'My Professional CV',
            text: text,
            url: url
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text + '\n' + url).then(() => {
            alert('✅ Link copied to clipboard!');
        }).catch(() => {
            prompt('Copy this link:', url);
        });
    }
}

// ============================================
// LOCAL STORAGE
// ============================================
function saveToLocalStorage() {
    const data = {
        fullName: DOM.fullName.value,
        jobTitle: DOM.jobTitle.value,
        email: DOM.email.value,
        phone: DOM.phone.value,
        address: DOM.address.value,
        education: DOM.education.value,
        experience: DOM.experience.value,
        skills: DOM.skills.value,
        certifications: DOM.certifications.value,
        portfolio: DOM.portfolio.value,
        photo: photoData,
        template: currentTemplate
    };
    
    localStorage.setItem('cv_data', JSON.stringify(data));
    alert('✅ Draft saved successfully!');
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('cv_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            DOM.fullName.value = data.fullName || '';
            DOM.jobTitle.value = data.jobTitle || '';
            DOM.email.value = data.email || '';
            DOM.phone.value = data.phone || '';
            DOM.address.value = data.address || '';
            DOM.education.value = data.education || '';
            DOM.experience.value = data.experience || '';
            DOM.skills.value = data.skills || '';
            DOM.certifications.value = data.certifications || '';
            DOM.portfolio.value = data.portfolio || '';
            
            if (data.photo) {
                photoData = data.photo;
                document.getElementById('photoPreview').innerHTML = `<img src="${photoData}" alt="Profile">`;
                document.getElementById('cvPhoto').innerHTML = `<img src="${photoData}" alt="Profile">`;
            }
            
            if (data.template) {
                changeTemplate(data.template);
            }
            
            generateCV();
            console.log('✅ Data loaded from localStorage');
        } catch(e) {
            console.error('Error loading data:', e);
        }
    }
}

// ============================================
// CLEAR ALL
// ============================================
function clearAll() {
    if (confirm('Are you sure you want to clear all data?')) {
        document.querySelectorAll('input, textarea').forEach(el => {
            el.value = '';
        });
        photoData = null;
        document.getElementById('photoPreview').innerHTML = '';
        document.getElementById('cvPhoto').innerHTML = '<i class="fas fa-user-circle"></i>';
        DOM.cvName.textContent = 'Your Name';
        DOM.cvJobTitle.textContent = 'Job Title';
        DOM.cvEmail.textContent = '📧 Email';
        DOM.cvPhone.textContent = '📞 Phone';
        DOM.cvAddress.textContent = '📍 Address';
        DOM.cvEducation.textContent = 'Education details appear here';
        DOM.cvExperience.textContent = 'Work experience appears here';
        DOM.cvSkills.innerHTML = '<span class="skill-tag">Skill</span>';
        DOM.cvCertifications.textContent = 'Certifications appear here';
        DOM.cvPortfolio.textContent = 'https://yourportfolio.com';
        
        localStorage.removeItem('cv_data');
    }
}

// ============================================
// DARK MODE
// ============================================
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('darkModeBtn');
    if (document.body.classList.contains('dark-mode')) {
        btn.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('cv_darkmode', 'true');
    } else {
        btn.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('cv_darkmode', 'false');
    }
}

// Load dark mode preference
if (localStorage.getItem('cv_darkmode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeBtn').innerHTML = '<i class="fas fa-sun"></i>';
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        generateCV();
    }
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveToLocalStorage();
    }
    if (e.key === 'Escape') {
        closeLogin();
    }
});

console.log('🚀 Professional CV Builder Loaded Successfully!');
console.log('💡 Shortcuts: Ctrl+G=Generate, Ctrl+S=Save');
