// static/js/script.js
document.addEventListener("DOMContentLoaded", () => {
  const memeForm = document.getElementById("meme-form");
  const posterForm = document.getElementById("poster-form");
  const fetchTemplatesBtn = document.getElementById("fetch-templates-btn");
  const templateSearch = document.getElementById("template-search");

  const loadingSpinner = document.getElementById("loading-spinner");
  const loadingMessage = document.getElementById("loading-message");
  const resultDisplay = document.getElementById("result-display");
  const resultImage = document.getElementById("result-image");
  const downloadBtn = document.getElementById("download-btn");
  const copyBtn = document.getElementById("copy-btn");
  const errorMessage = document.getElementById("error-message");
  const generateButtons = document.querySelectorAll(".generate-btn");

  const templateBrowserContainer = document.getElementById(
    "template-browser-container"
  );
  const memeTemplateSelect = document.getElementById("meme-template");
  const topInput = document.getElementById("top-text");
  const bottomInput = document.getElementById("bottom-text");
  const aiPrompt = document.getElementById("ai-prompt");
  const promptCount = document.getElementById("prompt-count");

  const addCustomTextBtn = document.getElementById("add-custom-text-btn");
  const customTextContainer = document.getElementById("custom-text-container");
  const MAX_CUSTOM_TEXTS = 10;
  let customTextCounter = 0;
  let allTemplates = [];
  let currentObjectUrl = null;
  let currentBlob = null;
  let memeCount = 0;
  let loadingTimer = null;

  // Effects are decorative; fall back to no-ops if effects.js failed to load
  const FX = window.MemeFX || {
    confetti() {},
    confettiFrom() {},
    emojiRain() {},
    toast() {},
  };

  const CAPTIONS = [
    ["One does not simply", "write good bottom text"],
    ["Me: I'll sleep early tonight", "Also me at 3am:"],
    ["It works on my machine", "Then we'll ship your machine"],
    ["Nobody:", "Absolutely nobody:"],
    ["Brace yourselves", "Mondays are coming"],
    ["Y u no", "commit your code"],
    ["I don't always test my code", "but when I do, I do it in production"],
    ["Just one more episode", "*sunrise*"],
    ["99 little bugs in the code", "patch one, 127 bugs in the code"],
    ["Not sure if genius", "or just lucky"],
  ];
  const PROMPTS = [
    "A capybara CEO giving a TED talk, dramatic lighting",
    "A doge astronaut planting a flag on the moon, vintage NASA poster",
    "A raccoon barista making latte art, cozy anime style",
    "A shiba inu samurai under cherry blossoms, ukiyo-e print",
    "A cat DJ at a neon rave, vaporwave aesthetic",
    "A penguin detective in a rainy noir city, film poster",
    "A frog knight riding a snail into battle, epic fantasy art",
  ];
  const LOADING_MESSAGES = [
    "Cooking up something dank...",
    "Consulting the meme council 🧙",
    "Adding extra deep-fry 🍟",
    "Calibrating the Impact font...",
    "Asking the frog for approval 🐸",
    "Warming up the AI hamsters 🐹",
    "Summoning the ancient memes 🗿",
    "Almost there... probably 👀",
  ];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Restart a CSS animation on an element by re-adding its class
  function replayClass(el, className) {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }

  addCustomTextBtn.addEventListener("click", () => {
    if (customTextContainer.children.length >= MAX_CUSTOM_TEXTS) {
      showError(`You can add up to ${MAX_CUSTOM_TEXTS} custom text boxes.`);
      return;
    }
    customTextCounter++;
    const newTextBox = document.createElement("div");
    newTextBox.classList.add("text-box-controls");
    newTextBox.innerHTML = `
            <fieldset>
                <legend>Custom Text ${customTextCounter}</legend>
                <div class="form-row">
                    <div class="form-group flex-grow-2">
                        <label>Text:</label>
                        <input type="text" class="form-control custom-text-input" placeholder="Your Text Here" maxlength="200">
                    </div>
                    <div class="form-group">
                        <label>X %:</label>
                        <input type="number" class="form-control custom-x-input" value="50" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label>Y %:</label>
                        <input type="number" class="form-control custom-y-input" value="50" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label>Size %:</label>
                        <input type="number" class="form-control custom-size-input" value="7" min="2" max="30">
                    </div>
                    <button type="button" class="btn btn-danger remove-text-box-btn">Remove</button>
                </div>
            </fieldset>
        `;
    customTextContainer.appendChild(newTextBox);
    newTextBox.querySelector(".custom-text-input").focus();
  });

  customTextContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-text-box-btn")) {
      const box = e.target.closest(".text-box-controls");
      const remove = () => {
        box.remove();
      };
      if (document.body.classList.contains("no-motion")) {
        remove();
        return;
      }
      box.classList.add("removing");
      box.addEventListener("animationend", remove, { once: true });
    }
  });

  document.getElementById("random-caption-btn").addEventListener("click", (e) => {
    const [top, bottom] = pick(CAPTIONS);
    topInput.value = top;
    bottomInput.value = bottom;
    FX.confettiFrom(e.currentTarget, 25);
  });

  // ---------- Poster helpers ----------
  function updatePromptCount() {
    promptCount.textContent = aiPrompt.value.length;
    promptCount.parentElement.classList.toggle(
      "near-limit",
      aiPrompt.value.length > 450
    );
  }
  aiPrompt.addEventListener("input", updatePromptCount);

  document.getElementById("prompt-chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    // Drop the leading emoji from the chip label
    aiPrompt.value = chip.textContent.trim().replace(/^\S+\s+/, "");
    updatePromptCount();
    aiPrompt.focus();
  });

  document.getElementById("surprise-btn").addEventListener("click", (e) => {
    aiPrompt.value = pick(PROMPTS);
    updatePromptCount();
    FX.confettiFrom(e.currentTarget, 25);
  });

  copyBtn.addEventListener("click", async () => {
    if (!currentBlob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [currentBlob.type]: currentBlob }),
      ]);
      FX.toast("📋 Copied! Go spread the meme.");
    } catch {
      FX.toast("😬 Your browser won't let me copy images. Use Download instead.");
    }
  });

  memeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const customTexts = [];
    const customControls =
      customTextContainer.querySelectorAll(".text-box-controls");
    customControls.forEach((control) => {
      customTexts.push({
        text: control.querySelector(".custom-text-input").value,
        x: control.querySelector(".custom-x-input").value,
        y: control.querySelector(".custom-y-input").value,
        size: control.querySelector(".custom-size-input").value,
      });
    });

    const payload = {
      template: memeTemplateSelect.value,
      top_text: topInput.value,
      bottom_text: bottomInput.value,
      custom_texts: customTexts,
    };
    await generateImage("/generate_meme", payload, "meme.png");
  });

  posterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = aiPrompt.value.trim();
    if (!prompt) {
      showError("Please enter a prompt for the AI poster.");
      return;
    }
    await generateImage("/generate_poster", { prompt }, "poster.png");
  });

  fetchTemplatesBtn.addEventListener("click", async () => {
    templateBrowserContainer.innerHTML = '<div class="spinner"></div>';
    fetchTemplatesBtn.disabled = true;
    fetchTemplatesBtn.textContent = "Loading...";
    try {
      const response = await fetch("/fetch_templates");
      const data = await parseJson(response);
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch templates from server.");
      }
      allTemplates = data;
      templateBrowserContainer.classList.add("entering");
      displayTemplates(allTemplates);
      fetchTemplatesBtn.style.display = "none";
      templateSearch.style.display = "block";
      FX.toast(`🔥 ${allTemplates.length} templates loaded`);
    } catch (error) {
      templateBrowserContainer.innerHTML = "";
      const box = document.createElement("div");
      box.className = "error-box";
      box.textContent = error.message;
      templateBrowserContainer.appendChild(box);
      // Let the user retry instead of hiding the button
      fetchTemplatesBtn.disabled = false;
      fetchTemplatesBtn.textContent = "Retry";
    }
  });

  templateSearch.addEventListener("input", () => {
    templateBrowserContainer.classList.remove("entering");
    const query = templateSearch.value.trim().toLowerCase();
    displayTemplates(
      allTemplates.filter((t) => t.name.toLowerCase().includes(query))
    );
  });

  function displayTemplates(templates) {
    templateBrowserContainer.innerHTML = "";
    if (templates.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No templates match your search. 🦗";
      templateBrowserContainer.appendChild(empty);
      return;
    }
    // Build with DOM APIs so template names can't inject HTML
    templates.forEach((template, index) => {
      const card = document.createElement("div");
      card.classList.add("template-card");
      card.style.setProperty("--i", index);

      const img = document.createElement("img");
      img.src = template.url;
      img.alt = template.name;
      img.loading = "lazy";

      const name = document.createElement("p");
      name.className = "template-name";
      name.textContent = template.name;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-secondary use-template-btn";
      button.dataset.url = template.url;
      button.dataset.name = template.name;
      button.textContent = "Use This";

      card.append(img, name, button);
      templateBrowserContainer.appendChild(card);
    });
  }

  templateBrowserContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("use-template-btn")) {
      const { name, url } = e.target.dataset;
      if (![...memeTemplateSelect.options].some((opt) => opt.value === url)) {
        memeTemplateSelect.add(new Option(name, url));
      }
      memeTemplateSelect.value = url;
      FX.confettiFrom(e.target, 30);
      FX.toast(`✅ "${name}" loaded into the generator`);
      memeForm.scrollIntoView({ behavior: "smooth" });
      e.target.textContent = "Added!";
      e.target.disabled = true;
      setTimeout(() => {
        e.target.textContent = "Use This";
        e.target.disabled = false;
      }, 1500);
    }
  });

  async function parseJson(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  async function generateImage(endpoint, body, filename) {
    showLoading(true);
    hideError();
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await parseJson(response);
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }
      const imageBlob = await response.blob();
      currentBlob = imageBlob;
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = URL.createObjectURL(imageBlob);
      resultImage.src = currentObjectUrl;
      // Decode off the main thread first so the pop-in animation doesn't
      // stall on decoding a large PNG mid-frame
      await resultImage.decode().catch(() => {});
      downloadBtn.href = currentObjectUrl;
      downloadBtn.download = filename;
      // Hide the loader before revealing the result so the layout doesn't
      // shift underneath the smooth scroll
      showLoading(false);
      resultDisplay.style.display = "block";
      resultDisplay.scrollIntoView({ behavior: "smooth", block: "center" });
      celebrate();
    } catch (error) {
      console.error("Error generating image:", error);
      showError(`Failed to generate image. ${error.message}`);
    } finally {
      showLoading(false);
    }
  }

  function celebrate() {
    memeCount++;
    const counter = document.getElementById("meme-count");
    counter.textContent = memeCount;
    replayClass(counter, "bump");
    // Burst once the smooth scroll settles, so the confetti starts from where
    // the image actually ends up and doesn't compete with the scroll
    afterScroll(() => {
      FX.confettiFrom(resultImage, 140);
      if (memeCount % 5 === 0) {
        FX.emojiRain(60);
        FX.toast(`🏆 ${memeCount} memes! You're a certified meme lord.`);
      }
    });
  }

  function afterScroll(callback) {
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      window.removeEventListener("scrollend", run);
      callback();
    };
    window.addEventListener("scrollend", run);
    // Fallback for browsers without scrollend, or when no scroll was needed
    setTimeout(run, 700);
  }

  function showLoading(isLoading) {
    clearInterval(loadingTimer);
    if (isLoading) {
      let i = 0;
      loadingMessage.textContent = LOADING_MESSAGES[0];
      loadingTimer = setInterval(() => {
        i = (i + 1) % LOADING_MESSAGES.length;
        loadingMessage.textContent = LOADING_MESSAGES[i];
      }, 2200);
    }
    loadingSpinner.style.display = isLoading ? "block" : "none";
    generateButtons.forEach((btn) => (btn.disabled = isLoading));
    if (isLoading) {
      resultDisplay.style.display = "none";
      loadingSpinner.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
  function showError(message) {
    errorMessage.textContent = `💀 ${message}`;
    // Hide then show so the shake animation replays on repeat errors
    errorMessage.style.display = "none";
    void errorMessage.offsetWidth;
    errorMessage.style.display = "block";
  }
  function hideError() {
    errorMessage.style.display = "none";
  }
});
