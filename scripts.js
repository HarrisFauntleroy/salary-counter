// DOM Elements
const themeToggle = document.getElementById("themeToggle");
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const salaryInput = document.getElementById("salary");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const workDaysPerWeekInput = document.getElementById("workDaysPerWeek");
const workHoursPerDayInput = document.getElementById("workHoursPerDay");
const vacationDaysInput = document.getElementById("vacationDays");
const breakTimeInput = document.getElementById("breakTime");
const taxRateInput = document.getElementById("taxRate");
const currencySelect = document.getElementById("currency");
const showParticlesCheckbox = document.getElementById("showParticles");
const showMilestonesCheckbox = document.getElementById("showMilestones");
const updateFrequencyInput = document.getElementById("updateFrequency");
const roundNumbersCheckbox = document.getElementById("roundNumbers");
const saveSettingsBtn = document.getElementById("saveSettings");
const profileSelect = document.getElementById("profileSelect");
const addProfileBtn = document.getElementById("addProfileBtn");
const deleteProfileBtn = document.getElementById("deleteProfileBtn");
const newProfileForm = document.getElementById("newProfileForm");
const profileNameInput = document.getElementById("profileName");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");

// Dashboard elements
const earnedTodayElement = document.getElementById("earnedToday");
const progressBarElement = document.getElementById("progressBar");
const progressPercentageElement = document.getElementById("progressPercentage");
const startTimeDisplayElement = document.getElementById("startTimeDisplay");
const endTimeDisplayElement = document.getElementById("endTimeDisplay");
const hourlyRateElement = document.getElementById("hourlyRate");
const dailyEarningsElement = document.getElementById("dailyEarnings");
const weeklyEarningsElement = document.getElementById("weeklyEarnings");
const monthlyEarningsElement = document.getElementById("monthlyEarnings");
const afterTaxEarningsElement = document.getElementById("afterTaxEarnings");
const minuteEarningsElement = document.getElementById("minuteEarnings");
const currentDateElement = document.getElementById("currentDate");
const milestoneElement = document.getElementById("milestone");
const particleContainer = document.getElementById("particleContainer");

// Constants
const STORAGE_KEY = "moneyFlowSettings";
const MILESTONES = [
  { amount: 10, message: "You've earned enough for coffee!" },
  { amount: 20, message: "You've earned enough for lunch!" },
  { amount: 50, message: "You've earned enough for dinner!" },
  { amount: 100, message: "You've earned enough for a nice dinner out!" },
  { amount: 200, message: "You've earned enough for a new outfit!" },
  { amount: 500, message: "You've earned enough for a weekend getaway!" },
];

// Default settings
let settings = {
  salary: 60000,
  startTime: "09:00",
  endTime: "17:00",
  workDaysPerWeek: 5,
  workHoursPerDay: 8,
  vacationDays: 15,
  breakTime: 60,
  taxRate: 20,
  currency: "$",
  showParticles: true,
  showMilestones: true,
  updateFrequency: 1,
  roundNumbers: false,
  darkMode: false,
};

// State
let profiles = {
  default: { ...settings },
};
let currentProfile = "default";
let updateInterval;
let reachedMilestones = [];
let lastEarned = 0;

// Initialize
function init() {
  loadSettings();
  applySettings();
  setupEventListeners();
  updateCalculations();
  startRealTimeUpdates();
  updateCurrentDate();
}

// Load settings from localStorage
function loadSettings() {
  const savedSettings = localStorage.getItem(STORAGE_KEY);
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    if (parsed.profiles) {
      profiles = parsed.profiles;
    } else {
      profiles = { default: parsed };
    }

    if (parsed.currentProfile) {
      currentProfile = parsed.currentProfile;
    }

    settings = { ...profiles[currentProfile] };
  }

  updateProfileDropdown();
}

// Save settings to localStorage
function saveSettings() {
  profiles[currentProfile] = { ...settings };
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      profiles,
      currentProfile,
    }),
  );
}

// Apply settings to UI
function applySettings() {
  salaryInput.value = settings.salary;
  startTimeInput.value = settings.startTime;
  endTimeInput.value = settings.endTime;
  workDaysPerWeekInput.value = settings.workDaysPerWeek;
  workHoursPerDayInput.value = settings.workHoursPerDay;
  vacationDaysInput.value = settings.vacationDays;
  breakTimeInput.value = settings.breakTime;
  taxRateInput.value = settings.taxRate;
  currencySelect.value = settings.currency;
  showParticlesCheckbox.checked = settings.showParticles;
  showMilestonesCheckbox.checked = settings.showMilestones;
  updateFrequencyInput.value = settings.updateFrequency;
  roundNumbersCheckbox.checked = settings.roundNumbers;

  document
    .querySelector("html")
    .setAttribute("data-theme", settings.darkMode ? "dark" : "light");
  themeToggle.innerHTML = settings.darkMode
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';

  updateTimeDisplay();
}

// Update time display elements
function updateTimeDisplay() {
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  startTimeDisplayElement.textContent = `Start: ${formatTime(
    settings.startTime,
  )}`;
  endTimeDisplayElement.textContent = `End: ${formatTime(settings.endTime)}`;
}

// Setup event listeners
function setupEventListeners() {
  // Theme toggle
  themeToggle.addEventListener("click", () => {
    settings.darkMode = !settings.darkMode;
    document
      .querySelector("html")
      .setAttribute("data-theme", settings.darkMode ? "dark" : "light");
    themeToggle.innerHTML = settings.darkMode
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    saveSettings();
  });

  // Tabs
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((tc) => tc.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // Save settings button
  saveSettingsBtn.addEventListener("click", () => {
    settings.salary = parseFloat(salaryInput.value);
    settings.startTime = startTimeInput.value;
    settings.endTime = endTimeInput.value;
    settings.workDaysPerWeek = parseInt(workDaysPerWeekInput.value, 10);
    settings.workHoursPerDay = parseFloat(workHoursPerDayInput.value);
    settings.vacationDays = parseInt(vacationDaysInput.value, 10);
    settings.breakTime = parseInt(breakTimeInput.value, 10);
    settings.taxRate = parseFloat(taxRateInput.value);
    settings.currency = currencySelect.value;
    settings.showParticles = showParticlesCheckbox.checked;
    settings.showMilestones = showMilestonesCheckbox.checked;
    settings.updateFrequency = parseFloat(updateFrequencyInput.value);
    settings.roundNumbers = roundNumbersCheckbox.checked;

    saveSettings();
    updateCalculations();
    updateTimeDisplay();
    restartRealTimeUpdates();

    // Switch to dashboard
    tabs[0].click();
  });

  // Profile management
  profileSelect.addEventListener("change", () => {
    currentProfile = profileSelect.value;
    settings = { ...profiles[currentProfile] };
    applySettings();
    updateCalculations();
    restartRealTimeUpdates();
    saveSettings();
  });

  addProfileBtn.addEventListener("click", () => {
    newProfileForm.style.display = "block";
  });

  saveProfileBtn.addEventListener("click", () => {
    const profileName = profileNameInput.value.trim();
    if (profileName) {
      // Create new profile with current settings
      profiles[profileName] = { ...settings };
      currentProfile = profileName;
      saveSettings();
      updateProfileDropdown();
      newProfileForm.style.display = "none";
      profileNameInput.value = "";
    }
  });

  cancelProfileBtn.addEventListener("click", () => {
    newProfileForm.style.display = "none";
    profileNameInput.value = "";
  });

  deleteProfileBtn.addEventListener("click", () => {
    if (
      currentProfile !== "default" &&
      confirm(`Delete profile "${currentProfile}"?`)
    ) {
      delete profiles[currentProfile];
      currentProfile = "default";
      settings = { ...profiles[currentProfile] };
      saveSettings();
      updateProfileDropdown();
      applySettings();
      updateCalculations();
      restartRealTimeUpdates();
    }
  });
}

// Update profile dropdown
function updateProfileDropdown() {
  profileSelect.innerHTML = "";
  Object.keys(profiles).forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile;
    option.textContent = profile;
    if (profile === currentProfile) {
      option.selected = true;
    }
    profileSelect.appendChild(option);
  });
}

// Update calculations
function updateCalculations() {
  const salary = settings.salary;
  const workDaysPerWeek = settings.workDaysPerWeek;
  const workDaysPerYear = workDaysPerWeek * 52 - settings.vacationDays;
  const workHoursPerDay = settings.workHoursPerDay - settings.breakTime / 60;
  const workHoursPerWeek = workHoursPerDay * workDaysPerWeek;
  const workHoursPerYear = workHoursPerDay * workDaysPerYear;

  const hourlyRate = salary / workHoursPerYear;
  const dailyRate = hourlyRate * workHoursPerDay;
  const weeklyRate = dailyRate * workDaysPerWeek;
  const monthlyRate = salary / 12;
  const minuteRate = hourlyRate / 60;

  // Calculate tax more accurately using tax brackets if available
  let afterTaxRate;

  if (settings.currency === "A$" && salary > 0) {
    // Australian tax brackets for 2024-2025
    const taxBrackets = [
      { threshold: 0, rate: 0 },
      { threshold: 18200, rate: 0.19 },
      { threshold: 45000, rate: 0.3 },
      { threshold: 135000, rate: 0.37 },
      { threshold: 190000, rate: 0.45 },
    ];

    let tax = 0;
    let prev = 0;

    for (let i = 1; i < taxBrackets.length; i++) {
      if (salary > taxBrackets[i].threshold) {
        tax +=
          (Math.min(salary, taxBrackets[i].threshold) -
            taxBrackets[i - 1].threshold) *
          taxBrackets[i - 1].rate;
        prev = taxBrackets[i].threshold;
      } else {
        tax += (salary - prev) * taxBrackets[i - 1].rate;
        break;
      }
    }

    if (salary > taxBrackets[taxBrackets.length - 1].threshold) {
      tax +=
        (salary - taxBrackets[taxBrackets.length - 1].threshold) *
        taxBrackets[taxBrackets.length - 1].rate;
    }

    // Add Medicare levy (2% for Australia)
    const medicareLevy = salary * 0.02;

    const annualAfterTax = salary - tax - medicareLevy;
    afterTaxRate = annualAfterTax / 12;
  } else {
    // Fallback to simple flat tax rate calculation
    afterTaxRate = monthlyRate * (1 - settings.taxRate / 100);
  }

  const formatCurrency = (value) => {
    if (settings.roundNumbers) {
      return `${settings.currency}${Math.round(value).toLocaleString()}`;
    }
    return `${settings.currency}${value.toFixed(2)}`;
  };

  hourlyRateElement.textContent = formatCurrency(hourlyRate);
  dailyEarningsElement.textContent = formatCurrency(dailyRate);
  weeklyEarningsElement.textContent = formatCurrency(weeklyRate);
  monthlyEarningsElement.textContent = formatCurrency(monthlyRate);
  afterTaxEarningsElement.textContent = formatCurrency(afterTaxRate);
  minuteEarningsElement.textContent = formatCurrency(minuteRate);
}

// Start real-time updates
function startRealTimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  updateInterval = setInterval(
    updateRealTimeEarnings,
    settings.updateFrequency * 1000,
  );
  updateRealTimeEarnings(); // Initial update
}

// Restart real-time updates (after settings change)
function restartRealTimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  reachedMilestones = []; // Reset milestones
  updateInterval = setInterval(
    updateRealTimeEarnings,
    settings.updateFrequency * 1000,
  );
  updateRealTimeEarnings();
}

// Update real-time earnings
function updateRealTimeEarnings() {
  const now = new Date();
  const startTime = new Date(now);
  const endTime = new Date(now);

  const [startHour, startMinute] = settings.startTime.split(":");
  const [endHour, endMinute] = settings.endTime.split(":");

  startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
  endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

  // Check if current time is within working hours and it's a workday
  // Consider workdays based on settings.workDaysPerWeek
  let isWorkday = false;
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  if (settings.workDaysPerWeek === 5) {
    // Assume Monday-Friday for 5-day work week
    isWorkday = day > 0 && day < 6;
  } else if (settings.workDaysPerWeek === 6) {
    // Assume Monday-Saturday for 6-day work week
    isWorkday = day > 0 && day < 7;
  } else if (settings.workDaysPerWeek === 7) {
    // All days are workdays for 7-day work week
    isWorkday = true;
  } else if (settings.workDaysPerWeek > 0) {
    // For other cases, start from Monday
    isWorkday = day > 0 && day <= settings.workDaysPerWeek;
  }

  if (!isWorkday) {
    earnedTodayElement.textContent = `${settings.currency}0.00`;
    progressBarElement.style.width = "0%";
    progressPercentageElement.textContent = "0%";
    return;
  }

  // Calculate work duration
  const totalWorkTimeInMs = endTime - startTime;
  const workHoursPerDay = settings.workHoursPerDay - settings.breakTime / 60;
  const effectiveWorkTimeInMs = workHoursPerDay * 60 * 60 * 1000;

  // Calculate elapsed work time
  let elapsedTimeInMs = now - startTime;
  if (elapsedTimeInMs < 0) {
    // Before work starts
    earnedTodayElement.textContent = `${settings.currency}0.00`;
    progressBarElement.style.width = "0%";
    progressPercentageElement.textContent = "0%";
    return;
  }

  if (now > endTime) {
    // After work ends
    elapsedTimeInMs = totalWorkTimeInMs;
  }

  // Calculate percentage complete
  const percentageComplete = Math.min(
    100,
    (elapsedTimeInMs / totalWorkTimeInMs) * 100,
  );
  progressBarElement.style.width = `${percentageComplete}%`;
  progressPercentageElement.textContent = `${Math.round(percentageComplete)}%`;

  // Calculate earnings
  const workDaysPerYear = settings.workDaysPerWeek * 52 - settings.vacationDays;
  const workHoursPerYear = workHoursPerDay * workDaysPerYear;
  const salary = settings.salary;
  const hourlyRate = salary / workHoursPerYear;

  // Account for breaks - assume break is evenly distributed
  const elapsedHours = elapsedTimeInMs / (1000 * 60 * 60);
  const adjustedElapsedHours = Math.min(elapsedHours, workHoursPerDay);

  const earnedToday = hourlyRate * adjustedElapsedHours;
  const formatCurrency = (value) => {
    if (settings.roundNumbers) {
      return `${settings.currency}${Math.round(value).toLocaleString()}`;
    }
    return `${settings.currency}${value.toFixed(2)}`;
  };

  earnedTodayElement.textContent = formatCurrency(earnedToday);

  // Show money particles
  if (settings.showParticles && lastEarned < earnedToday) {
    // Only create particle if the difference is significant enough
    const diff = earnedToday - lastEarned;
    if (diff > 0.01) {
      createMoneyParticle(diff);
    }
  }

  // Check milestones
  if (settings.showMilestones) {
    checkMilestones(earnedToday);
  }

  lastEarned = earnedToday;
}

// Create money particle
function createMoneyParticle(amount) {
  if (!settings.showParticles) return;

  const particle = document.createElement("div");
  particle.className = "money-particle";
  particle.textContent = `+${settings.currency}${amount.toFixed(2)}`;

  // Random position along the progress bar
  const progressWidth = progressBarElement.offsetWidth;
  const randomLeft = Math.floor(Math.random() * progressWidth);

  particle.style.left = `${randomLeft}px`;
  particle.style.bottom = "0";

  particleContainer.appendChild(particle);

  // Remove particle after animation completes
  setTimeout(() => {
    particleContainer.removeChild(particle);
  }, 3000);
}

// Check milestones
function checkMilestones(earnedToday) {
  if (!settings.showMilestones) return;

  for (const milestone of MILESTONES) {
    if (
      earnedToday >= milestone.amount &&
      !reachedMilestones.includes(milestone.amount)
    ) {
      reachedMilestones.push(milestone.amount);
      showMilestone(milestone.message);
      break;
    }
  }
}

// Show milestone notification
function showMilestone(message) {
  milestoneElement.innerHTML = `<i class="fas fa-trophy"></i> ${message}`;
  milestoneElement.style.display = "block";

  setTimeout(() => {
    milestoneElement.style.display = "none";
  }, 5000);
}

// Update current date
function updateCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", month: "short", day: "numeric" };
  currentDateElement.textContent = `(${now.toLocaleDateString(
    undefined,
    options,
  )})`;
}

// Initialize the app
init();
