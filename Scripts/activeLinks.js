window.addEventListener("load", () => {
    console.log("✔ activeLinks.js LOADED after full page load");

    let currentPage = window.location.pathname.split("/").pop().toLowerCase();

    console.log("📄 Current Page:", currentPage);

    function setActive(selector) {
        document.querySelectorAll(selector).forEach(link => {

            const linkPage = link.getAttribute("href").split("/").pop().toLowerCase();
            console.log(`Checking: ${linkPage} === ${currentPage}`);

            if (linkPage === currentPage) {
                console.log(`MATCHED: ${linkPage}`);
                link.classList.add("active");
            }
        });
    }

    setActive(".sidebar a");
    setActive(".navbar-links a");
});
document.addEventListener("DOMContentLoaded", () => {
    const settingsBtn = document.getElementById("settingsBtn");

    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            window.location.href = "../Pages/settingslayout.html";
        });
    }
});

function openNotificationModal() {
    document.getElementById("notificationModal").style.display = "flex";
}

function closeNotificationModal() {
    document.getElementById("notificationModal").style.display = "none";
}
document.addEventListener("DOMContentLoaded", () => {
    const notificationModal = document.getElementById("notificationModal");

    if (notificationModal) {
        notificationModal.addEventListener("click", function (e) {
            if (e.target === this) {
                closeNotificationModal();
            }
        });
    }
});

const messages = [
    {
        title: "New Alarm Triggered",
        desc: "Inverter GW3300 has stopped working",
        time: "Just now"
    },
    {
        title: "Report Generated",
        desc: "Monthly energy report is ready",
        time: "10 mins ago"
    }
];

// Call this AFTER DOM is loaded
document.addEventListener("DOMContentLoaded", renderMessages);

function renderMessages() {
    const emptyState = document.getElementById("emptyState");
    const list = document.getElementById("messageList");

    if (!emptyState || !list) {
        console.warn("Message elements not found");
        return;
    }

    // 🟢 IF NO MESSAGES → SHOW EMPTY STATE
    if (messages.length === 0) {
        emptyState.style.display = "block";
        list.style.display = "none";
        return;
    }

    // 🟢 IF MESSAGES EXIST → SHOW LIST
    emptyState.style.display = "none";
    list.style.display = "block";

    // Optional: populate messages dynamically
    list.innerHTML = messages.map(msg => `
        <div class="message-item unread">
            <div class="msg-icon">🔔</div>
            <div class="msg-content">
                <p class="msg-title">${msg.title}</p>
                <span class="msg-desc">${msg.desc}</span>
                <span class="msg-time">${msg.time}</span>
            </div>
        </div>
    `).join("");
}
