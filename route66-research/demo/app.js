const tabs = document.querySelectorAll(".tabs button");
const screens = document.querySelectorAll(".screen");
const cr10Rows = document.querySelectorAll(".cr10-row");
const rpeValue = document.querySelector("#rpe-value");
const sleepSlider = document.querySelector("#sleep-slider");
const sleepValue = document.querySelector("#sleep-value");
const sleepHoursSlider = document.querySelector("#sleep-hours-slider");
const sleepHoursValue = document.querySelector("#sleep-hours-value");
const rpeCount = document.querySelector("#rpe-count");
const logCount = document.querySelector("#log-count");
const sleepCount = document.querySelector("#sleep-count");
const cmjCount = document.querySelector("#cmj-count");
const sessionToggle = document.querySelector("#session-toggle");
const sessionPill = document.querySelector("#session-pill");
const activityLabel = document.querySelector("#activity-label");
const promptProgress = document.querySelector("#prompt-progress");
const savedOverlay = document.querySelector("#saved-overlay");
const saveRPEButton = document.querySelector("#save-rpe");
const cmjDuration = document.querySelector("#cmj-duration");
const cmjDurationValue = document.querySelector("#cmj-duration-value");
const cmjManual = document.querySelector("#cmj-manual");
const cmjManualDelay = document.querySelector("#cmj-manual-delay");
const cmjManualDelayValue = document.querySelector("#cmj-manual-delay-value");
const cmjManualDelayControl = document.querySelector("#cmj-manual-delay-control");
const restDayButton = document.querySelector("#rest-day-button");
const restDayDialog = document.querySelector("#rest-day-dialog");
const restDaySaved = document.querySelector("#rest-day-saved");
const todayShoeNumber = document.querySelector("#today-shoe-number");
const todayShoeInstruction = document.querySelector("#today-shoe-instruction");
const todayQueueCount = document.querySelector("#today-queue-count");
const syncQueueCount = document.querySelector("#sync-queue-count");
const queuePill = document.querySelector("#queue-pill");
const queueList = document.querySelector("#queue-list");

let todayIsRestDay = false;

const state = {
  rpe: 0,
  selectedRpe: null,
  sleep: 5,
  sleepHours: 8,
  log: 0,
  cmj: 0,
  cmjDuration: 10,
  cmjManualDelay: 10,
  sessionActive: false,
  progress: 0,
  queue: []
};

function updateRestDayPreview() {
  if (!todayIsRestDay) return;
  todayShoeNumber.textContent = "Rest";
  todayShoeInstruction.textContent = "Rest Day";
  restDayButton.textContent = "Today is labeled as a rest day";
  restDayButton.disabled = true;
  restDaySaved.textContent = "Tomorrow will use today's shoe assignment; all remaining assignments have shifted forward one day.";
}

updateRestDayPreview();

function formatQueueTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function renderQueue() {
  const count = state.queue.length;
  todayQueueCount.textContent = count;
  syncQueueCount.textContent = count;
  queuePill.textContent = count === 0 ? "Empty" : `${count} pending`;
  queuePill.classList.toggle("muted", count === 0);

  if (count === 0) {
    queueList.innerHTML = '<li class="queue-empty">Complete an RPE, sleep, daily log, or CMJ entry to preview the queue.</li>';
    return;
  }

  queueList.replaceChildren();
  state.queue.slice().reverse().forEach((item) => {
    const row = document.createElement("li");
    const details = document.createElement("div");
    const label = document.createElement("strong");
    const meta = document.createElement("span");
    const status = document.createElement("span");

    label.textContent = item.label;
    meta.textContent = `${item.detail} · ${formatQueueTime(item.createdAt)}`;
    status.className = "queue-status";
    status.textContent = "Queued";
    details.append(label, meta);
    row.append(details, status);
    queueList.append(row);
  });
}

function addQueueItem(label, detail) {
  state.queue.push({ label, detail, createdAt: new Date() });
  renderQueue();
}

function switchToTab(target) {
  tabs.forEach((button) => button.classList.toggle("active", button.dataset.target === target));
  screens.forEach((screen) => screen.classList.toggle("active", screen.dataset.screen === target));
}

switchToTab("today");
renderQueue();

function showSavedOverlay() {
  savedOverlay.classList.add("show");
  window.setTimeout(() => savedOverlay.classList.remove("show"), 950);
}

function resetRPESelection() {
  state.selectedRpe = null;
  if (rpeValue) {
    rpeValue.textContent = "Tap";
  }
  cr10Rows.forEach((button) => button.classList.remove("selected"));
  saveRPEButton.disabled = true;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchToTab(tab.dataset.target);
  });
});

cr10Rows.forEach((row) => {
  row.addEventListener("click", () => {
    state.selectedRpe = Number(row.dataset.rpe);
    if (rpeValue) {
      rpeValue.textContent = row.dataset.display;
    }
    cr10Rows.forEach((button) => button.classList.remove("selected"));
    row.classList.add("selected");
    saveRPEButton.disabled = false;
  });
});

sleepSlider.addEventListener("input", () => {
  state.sleep = Number(sleepSlider.value);
  sleepValue.textContent = state.sleep.toFixed(1);
});

sleepHoursSlider.addEventListener("input", () => {
  state.sleepHours = Number(sleepHoursSlider.value);
  sleepHoursValue.textContent = state.sleepHours.toFixed(1);
});

cmjDuration.addEventListener("input", () => {
  state.cmjDuration = Number(cmjDuration.value);
  cmjDurationValue.textContent = `${state.cmjDuration} sec`;
});

cmjManual.addEventListener("change", () => {
  cmjManualDelayControl.hidden = !cmjManual.checked;
});

cmjManualDelay.addEventListener("input", () => {
  state.cmjManualDelay = Number(cmjManualDelay.value);
  cmjManualDelayValue.textContent = `${state.cmjManualDelay} sec`;
});

saveRPEButton.addEventListener("click", () => {
  if (state.selectedRpe === null) return;
  const selectedRow = Array.from(cr10Rows).find((row) => Number(row.dataset.rpe) === state.selectedRpe);
  const savedRpe = selectedRow?.dataset.display || String(state.selectedRpe);
  state.rpe += 1;
  rpeCount.textContent = state.rpe;
  document.querySelector("#rpe-saved").textContent = "Added to the demo queue";
  addQueueItem("RPE rating", `Rating ${savedRpe}`);
  resetRPESelection();
  showSavedOverlay();
  window.setTimeout(() => switchToTab("today"), 950);
});

document.querySelector("#save-sleep").addEventListener("click", () => {
  sleepCount.textContent = "1";
  document.querySelector("#sleep-saved").textContent = "Added to the demo queue";
  addQueueItem("Sleep entry", `${state.sleepHours.toFixed(1)} hours · quality ${state.sleep.toFixed(1)}`);
  showSavedOverlay();
});

document.querySelector("#save-log").addEventListener("click", () => {
  state.log = 1;
  logCount.textContent = state.log;
  document.querySelector("#log-saved").textContent = "Added to the demo queue";
  addQueueItem("Daily log", "VAS responses and notes");
  showSavedOverlay();
});

document.querySelector("#open-cmj-from-log").addEventListener("click", () => {
  switchToTab("cmj");
});

document.querySelector("#record-cmj").addEventListener("click", (event) => {
  event.target.disabled = true;
  const status = document.querySelector("#cmj-status");
  const automaticSetup = ["Rear flash held: framing confirmed"];
  const manualSetup = [`Manual countdown: ${state.cmjManualDelay} seconds`];
  const steps = [
    ...(cmjManual.checked ? manualSetup : automaticSetup),
    "Countdown flash: 3",
    "Countdown flash: 2",
    "Countdown flash: 1",
    `Recording ${state.cmjDuration} seconds...`
  ];
  let index = 0;
  status.textContent = steps[index];
  const timer = window.setInterval(() => {
    index += 1;
    if (index < steps.length) {
      status.textContent = steps[index];
      return;
    }
    window.clearInterval(timer);
    state.cmj += 1;
    cmjCount.textContent = state.cmj;
    status.textContent = "CMJ set added to the demo queue.";
    addQueueItem("CMJ recording", `Set ${state.cmj} · ${state.cmjDuration} seconds`);
    event.target.textContent = `Record CMJ Set ${state.cmj + 1}`;
    event.target.disabled = false;
  }, 800);
});

sessionToggle.addEventListener("click", () => {
  state.sessionActive = !state.sessionActive;
  sessionToggle.textContent = state.sessionActive ? "Stop Session" : "Start Session";
  sessionPill.textContent = state.sessionActive ? "Running" : "Stopped";
  sessionPill.classList.toggle("muted", !state.sessionActive);
  activityLabel.textContent = state.sessionActive ? "Walking/running/stroller motion detected" : "Idle";
});

document.querySelector("#prompt-now").addEventListener("click", () => {
  state.progress = 100;
  promptProgress.style.width = "100%";
  switchToTab("rpe");
});

restDayButton.addEventListener("click", () => {
  restDayDialog.showModal();
});

document.querySelector("#cancel-rest-day").addEventListener("click", () => {
  restDayDialog.close();
});

document.querySelector("#confirm-rest-day").addEventListener("click", () => {
  todayIsRestDay = true;
  restDayDialog.close();
  updateRestDayPreview();
  addQueueItem("Rest day update", "Shoe schedule shifted forward");
});

window.setInterval(() => {
  if (!state.sessionActive) return;
  state.progress = Math.min(100, state.progress + 4);
  promptProgress.style.width = `${state.progress}%`;
  if (state.progress >= 100) {
    state.progress = 0;
  }
}, 1000);
