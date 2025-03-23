// DOM Elements
const themeToggle = document.getElementById("themeToggle");
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const salaryInput = document.getElementById("salary");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
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

// Get workHoursPerWeekInput after the DOM is fully loaded to avoid null reference
let workHoursPerWeekInput = document.getElementById("workHoursPerWeek");

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
  workHoursPerWeek: 38, // New setting replacing workDaysPerWeek and workHoursPerDay
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
  // Make sure we first load settings before attempting to apply them
  loadSettings();

  // Ensure DOM is fully loaded before trying to access elements
  document.addEventListener("DOMContentLoaded", function () {
    // Re-fetch the workHoursPerWeekInput element
    workHoursPerWeekInput = document.getElementById("workHoursPerWeek");
    applySettings();
    setupEventListeners();
    updateCalculations();
    startRealTimeUpdates();
    updateCurrentDate();
  });

  // If DOM is already loaded, run these functions immediately
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // Re-fetch the workHoursPerWeekInput element
    workHoursPerWeekInput = document.getElementById("workHoursPerWeek");
    applySettings();
    setupEventListeners();
    updateCalculations();
    startRealTimeUpdates();
    updateCurrentDate();
  }
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

    // Handle legacy settings that used workDaysPerWeek and workHoursPerDay
    if (
      settings.workDaysPerWeek &&
      settings.workHoursPerDay &&
      !settings.workHoursPerWeek
    ) {
      settings.workHoursPerWeek =
        settings.workDaysPerWeek * settings.workHoursPerDay;
      delete settings.workDaysPerWeek;
      delete settings.workHoursPerDay;
    }
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
  if (salaryInput) salaryInput.value = settings.salary;
  if (startTimeInput) startTimeInput.value = settings.startTime;
  if (endTimeInput) endTimeInput.value = settings.endTime;
  // Safely set workHoursPerWeekInput value only if the element exists
  if (workHoursPerWeekInput)
    workHoursPerWeekInput.value = settings.workHoursPerWeek;
  if (vacationDaysInput) vacationDaysInput.value = settings.vacationDays;
  if (breakTimeInput) breakTimeInput.value = settings.breakTime;
  if (taxRateInput) taxRateInput.value = settings.taxRate;
  if (currencySelect) currencySelect.value = settings.currency;
  if (showParticlesCheckbox)
    showParticlesCheckbox.checked = settings.showParticles;
  if (showMilestonesCheckbox)
    showMilestonesCheckbox.checked = settings.showMilestones;
  if (updateFrequencyInput)
    updateFrequencyInput.value = settings.updateFrequency;
  if (roundNumbersCheckbox)
    roundNumbersCheckbox.checked = settings.roundNumbers;

  const htmlElement = document.querySelector("html");
  if (htmlElement) {
    htmlElement.setAttribute(
      "data-theme",
      settings.darkMode ? "dark" : "light",
    );
  }

  if (themeToggle) {
    themeToggle.innerHTML = settings.darkMode
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }

  updateTimeDisplay();
}

// Update time display elements
function updateTimeDisplay() {
  if (!startTimeDisplayElement || !endTimeDisplayElement) return;

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
  if (themeToggle) {
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
  }

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
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", saveSettingsHandler);
  }

  // Profile management
  if (profileSelect) {
    profileSelect.addEventListener("change", () => {
      currentProfile = profileSelect.value;
      settings = { ...profiles[currentProfile] };
      applySettings();
      updateCalculations();
      restartRealTimeUpdates();
      saveSettings();
    });
  }

  if (addProfileBtn) {
    addProfileBtn.addEventListener("click", () => {
      newProfileForm.style.display = "block";
    });
  }

  if (saveProfileBtn) {
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
  }

  if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener("click", () => {
      newProfileForm.style.display = "none";
      profileNameInput.value = "";
    });
  }

  if (deleteProfileBtn) {
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
}

// Update profile dropdown
function updateProfileDropdown() {
  if (!profileSelect) return;

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

// Save settings handler
function saveSettingsHandler() {
  // Make sure we re-fetch workHoursPerWeekInput
  workHoursPerWeekInput = document.getElementById("workHoursPerWeek");

  if (salaryInput) settings.salary = parseFloat(salaryInput.value);
  if (startTimeInput) settings.startTime = startTimeInput.value;
  if (endTimeInput) settings.endTime = endTimeInput.value;
  if (workHoursPerWeekInput)
    settings.workHoursPerWeek = parseFloat(workHoursPerWeekInput.value);
  if (vacationDaysInput)
    settings.vacationDays = parseInt(vacationDaysInput.value, 10);
  if (breakTimeInput) settings.breakTime = parseInt(breakTimeInput.value, 10);
  if (taxRateInput) settings.taxRate = parseFloat(taxRateInput.value);
  if (currencySelect) settings.currency = currencySelect.value;
  if (showParticlesCheckbox)
    settings.showParticles = showParticlesCheckbox.checked;
  if (showMilestonesCheckbox)
    settings.showMilestones = showMilestonesCheckbox.checked;
  if (updateFrequencyInput)
    settings.updateFrequency = parseFloat(updateFrequencyInput.value);
  if (roundNumbersCheckbox)
    settings.roundNumbers = roundNumbersCheckbox.checked;

  saveSettings();
  updateCalculations();
  updateTimeDisplay();
  restartRealTimeUpdates();

  // Switch to dashboard
  tabs[0].click();
}

// Updated calculations using work hours per week
function updateCalculations() {
  const salary = settings.salary;
  const workHoursPerWeek = settings.workHoursPerWeek;

  // Calculate work days and hours for internal use
  // We'll use 5 days as standard work week for vacation purposes
  const standardWorkDays = 5;
  const hoursPerDay = workHoursPerWeek / standardWorkDays;

  // Calculate annual work weeks (52 - vacation weeks)
  const vacationWeeks = settings.vacationDays / standardWorkDays;
  const workWeeksPerYear = 52 - vacationWeeks;

  // Calculate total annual work hours
  const totalAnnualWorkHours = workWeeksPerYear * workHoursPerWeek;

  // Calculate daily break time impact (proportional to work day)
  const breakTimeHours = settings.breakTime / 60;
  const breakProportion = breakTimeHours / hoursPerDay;
  const effectiveHoursPerWeek = workHoursPerWeek * (1 - breakProportion);

  // Calculate effective annual hours
  const effectiveAnnualHours = workWeeksPerYear * effectiveHoursPerWeek;

  // Calculate hourly rate
  const hourlyRate = salary / effectiveAnnualHours;

  // Calculate daily rate (based on effective hours per day)
  const effectiveHoursPerDay = effectiveHoursPerWeek / standardWorkDays;
  const dailyRate = hourlyRate * effectiveHoursPerDay;

  // Calculate weekly rate
  const weeklyRate = dailyRate * standardWorkDays;

  // Calculate monthly rate (salary / 12)
  const monthlyRate = salary / 12;

  // Calculate per-minute rate
  const minuteRate = hourlyRate / 60;

  // Calculate after-tax earnings based on Australian tax brackets or simple rate
  let afterTaxRate;

  if (settings.currency === "A$" && salary > 0) {
    // Australian tax brackets for 2024-2025
    const taxBrackets = [
      { threshold: 0, rate: 0 },
      { threshold: 18200, rate: 0.19 },
      { threshold: 45000, rate: 0.3 },
      { threshold: 120000, rate: 0.37 },
      { threshold: 180000, rate: 0.45 },
    ];

    let tax = 0;

    // Apply tax brackets correctly
    for (let i = 1; i < taxBrackets.length; i++) {
      const prevThreshold = taxBrackets[i - 1].threshold;
      const currThreshold = taxBrackets[i].threshold;

      if (salary > prevThreshold) {
        const taxableInBracket =
          Math.min(salary, currThreshold) - prevThreshold;
        tax += taxableInBracket * taxBrackets[i - 1].rate;
      }

      if (salary <= currThreshold) break;
    }

    // Apply tax to amount exceeding highest bracket
    if (salary > taxBrackets[taxBrackets.length - 1].threshold) {
      tax +=
        (salary - taxBrackets[taxBrackets.length - 1].threshold) *
        taxBrackets[taxBrackets.length - 1].rate;
    }

    // Add Medicare levy (2% for Australia)
    const medicareLevy = salary * 0.02;

    // Calculate annual after-tax income
    const annualAfterTax = salary - tax - medicareLevy;
    afterTaxRate = annualAfterTax / 12;
  } else {
    // Simple tax calculation for other currencies
    afterTaxRate = monthlyRate * (1 - settings.taxRate / 100);
  }

  // Format currency values
  const formatCurrency = (value) => {
    if (settings.roundNumbers) {
      return `${settings.currency}${Math.round(value).toLocaleString()}`;
    }
    return `${settings.currency}${value.toFixed(2)}`;
  };

  // Update UI with calculated values
  if (hourlyRateElement)
    hourlyRateElement.textContent = formatCurrency(hourlyRate);
  if (dailyEarningsElement)
    dailyEarningsElement.textContent = formatCurrency(dailyRate);
  if (weeklyEarningsElement)
    weeklyEarningsElement.textContent = formatCurrency(weeklyRate);
  if (monthlyEarningsElement)
    monthlyEarningsElement.textContent = formatCurrency(monthlyRate);
  if (afterTaxEarningsElement)
    afterTaxEarningsElement.textContent = formatCurrency(afterTaxRate);
  if (minuteEarningsElement)
    minuteEarningsElement.textContent = formatCurrency(minuteRate);

  // Store these calculations for use in real-time updates
  settings.calculatedValues = {
    hourlyRate,
    dailyRate,
    weeklyRate,
    monthlyRate,
    afterTaxRate,
    minuteRate,
    hoursPerDay,
    effectiveHoursPerDay,
    standardWorkDays,
  };
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

// Update real-time earnings with simplified approach
function updateRealTimeEarnings() {
  if (!earnedTodayElement || !progressBarElement || !progressPercentageElement)
    return;

  const now = new Date();
  const startTime = new Date(now);
  const endTime = new Date(now);

  const [startHour, startMinute] = settings.startTime.split(":");
  const [endHour, endMinute] = settings.endTime.split(":");

  startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
  endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

  // Check if current time is within working hours and it's a workday
  let isWorkday = false;
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // We'll assume standard work days based on the weekly hours
  // For 5-day work week (most common), we'll use Monday-Friday
  isWorkday =
    day > 0 && day <= (settings.calculatedValues?.standardWorkDays || 5);

  if (!isWorkday || !settings.calculatedValues) {
    earnedTodayElement.textContent = `${settings.currency}0.00`;
    progressBarElement.style.width = "0%";
    progressPercentageElement.textContent = "0%";
    return;
  }

  // Calculate total scheduled work time (end time - start time)
  const totalScheduledTimeInMs = endTime - startTime;

  // Calculate elapsed time since work start
  let elapsedTimeInMs = now - startTime;

  // Handle time before work starts or after work ends
  if (elapsedTimeInMs < 0) {
    // Before work starts
    earnedTodayElement.textContent = `${settings.currency}0.00`;
    progressBarElement.style.width = "0%";
    progressPercentageElement.textContent = "0%";
    return;
  }

  if (now > endTime) {
    // After work ends
    elapsedTimeInMs = totalScheduledTimeInMs;
  }

  // Calculate percentage of workday completed
  const percentageComplete = Math.min(
    100,
    (elapsedTimeInMs / totalScheduledTimeInMs) * 100,
  );
  progressBarElement.style.width = `${percentageComplete}%`;
  progressPercentageElement.textContent = `${Math.round(percentageComplete)}%`;

  // Calculate elapsed work time accounting for breaks
  // Work time is the scheduled work hours minus break time
  const scheduledWorkDayHours = (endTime - startTime) / (1000 * 60 * 60);
  const effectiveWorkDayHours = settings.calculatedValues.effectiveHoursPerDay;

  // Calculate work ratio (proportion of scheduled time that's actual work)
  const workRatio = effectiveWorkDayHours / scheduledWorkDayHours;

  // Calculate elapsed hours and apply work ratio to account for breaks
  const elapsedHours = elapsedTimeInMs / (1000 * 60 * 60);
  const effectiveElapsedHours = elapsedHours * workRatio;

  // Calculate earnings based on hourly rate
  const earnedToday =
    settings.calculatedValues.hourlyRate * effectiveElapsedHours;

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
  if (!settings.showParticles || !particleContainer) return;

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
    if (particleContainer.contains(particle)) {
      particleContainer.removeChild(particle);
    }
  }, 3000);
}

// Check milestones
function checkMilestones(earnedToday) {
  if (!settings.showMilestones || !milestoneElement) return;

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
  if (!milestoneElement) return;

  milestoneElement.innerHTML = `<i class="fas fa-trophy"></i> ${message}`;
  milestoneElement.style.display = "block";

  setTimeout(() => {
    milestoneElement.style.display = "none";
  }, 5000);
}

// Update current date
function updateCurrentDate() {
  if (!currentDateElement) return;

  const now = new Date();
  const options = { weekday: "long", month: "short", day: "numeric" };
  currentDateElement.textContent = `(${now.toLocaleDateString(
    undefined,
    options,
  )})`;
}

// Initialize the app
init();
