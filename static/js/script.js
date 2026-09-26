// static/js/script.js
document.addEventListener("DOMContentLoaded", () => {
  const memeForm = document.getElementById("meme-form");
  const posterForm = document.getElementById("poster-form");
  const fetchTemplatesBtn = document.getElementById("fetch-templates-btn");
  const templateSearch = document.getElementById("template-search");

  const loadingSpinner = document.getElementById("loading-spinner");
  const resultDisplay = document.getElementById("result-display");
  const resultImage = document.getElementById("result-image");
  const downloadBtn = document.getElementById("download-btn");
  const errorMessage = document.getElementById("error-message");
  const generateButtons = document.querySelectorAll(".generate-btn");

  const templateBrowserContainer = document.getElementById(
    "template-browser-container"
  );
  const memeTemplateSelect = document.getElementById("meme-template");

  const addCustomTextBtn = document.getElementById("add-custom-text-btn");
  const customTextContainer = document.getElementById("custom-text-container");
  const MAX_CUSTOM_TEXTS = 10;
  let customTextCounter = 0;
  let allTemplates = [];
  let currentObjectUrl = null;

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
      e.target.closest(".text-box-controls").remove();
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
      top_text: document.getElementById("top-text").value,
      bottom_text: document.getElementById("bottom-text").value,
      custom_texts: customTexts,
    };
    await generateImage("/generate_meme", payload, "meme.png");
  });

  posterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = document.getElementById("ai-prompt").value.trim();
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
      displayTemplates(allTemplates);
      fetchTemplatesBtn.style.display = "none";
      templateSearch.style.display = "block";
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
      empty.textContent = "No templates match your search.";
      templateBrowserContainer.appendChild(empty);
      return;
    }
    // Build with DOM APIs so template names can't inject HTML
    templates.forEach((template) => {
      const card = document.createElement("div");
      card.classList.add("template-card");

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
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = URL.createObjectURL(imageBlob);
      resultImage.src = currentObjectUrl;
      downloadBtn.href = currentObjectUrl;
      downloadBtn.download = filename;
      resultDisplay.style.display = "block";
      resultDisplay.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      console.error("Error generating image:", error);
      showError(`Failed to generate image. ${error.message}`);
    } finally {
      showLoading(false);
    }
  }

  function showLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? "block" : "none";
    generateButtons.forEach((btn) => (btn.disabled = isLoading));
    if (isLoading) {
      resultDisplay.style.display = "none";
      loadingSpinner.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
  function hideError() {
    errorMessage.style.display = "none";
  }
});
