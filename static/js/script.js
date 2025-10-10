// static/js/script.js
document.addEventListener("DOMContentLoaded", () => {
  const memeForm = document.getElementById("meme-form");
  const posterForm = document.getElementById("poster-form");
  const fetchTemplatesBtn = document.getElementById("fetch-templates-btn");

  const loadingSpinner = document.getElementById("loading-spinner");
  const resultDisplay = document.getElementById("result-display");
  const resultImage = document.getElementById("result-image");
  const downloadBtn = document.getElementById("download-btn");
  const errorMessage = document.getElementById("error-message");

  const templateBrowserContainer = document.getElementById(
    "template-browser-container"
  );
  const memeTemplateSelect = document.getElementById("meme-template");

  const addCustomTextBtn = document.getElementById("add-custom-text-btn");
  const customTextContainer = document.getElementById("custom-text-container");
  let customTextCounter = 0;

  addCustomTextBtn.addEventListener("click", () => {
    customTextCounter++;
    const newTextBox = document.createElement("div");
    newTextBox.classList.add("text-box-controls");
    newTextBox.innerHTML = `
            <fieldset>
                <legend>Custom Text ${customTextCounter}</legend>
                <div class="form-row">
                    <div class="form-group flex-grow-2">
                        <label>Text:</label>
                        <input type="text" class="form-control custom-text-input" placeholder="Your Text Here">
                    </div>
                    <div class="form-group">
                        <label>X% (Left-Right):</label>
                        <input type="number" class="form-control custom-x-input" value="50" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label>Y% (Top-Bottom):</label>
                        <input type="number" class="form-control custom-y-input" value="50" min="0" max="100">
                    </div>
                    <button type="button" class="btn btn-danger remove-text-box-btn">Remove</button>
                </div>
            </fieldset>
        `;
    customTextContainer.appendChild(newTextBox);
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
      });
    });

    const payload = {
      template: memeTemplateSelect.value,
      top_text: document.getElementById("top-text").value,
      bottom_text: document.getElementById("bottom-text").value,
      custom_texts: customTexts,
    };
    await generateImage("/generate_meme", payload);
  });

  posterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = { prompt: document.getElementById("ai-prompt").value };
    await generateImage("/generate_poster", payload);
  });

  fetchTemplatesBtn.addEventListener("click", async () => {
    templateBrowserContainer.innerHTML = '<div class="spinner"></div>';
    fetchTemplatesBtn.disabled = true;
    fetchTemplatesBtn.textContent = "Loading...";
    try {
      const response = await fetch("/fetch_templates");
      if (!response.ok)
        throw new Error("Failed to fetch templates from server.");
      const templates = await response.json();
      displayTemplates(templates);
    } catch (error) {
      templateBrowserContainer.innerHTML = `<div class="error-box">${error.message}</div>`;
    } finally {
      fetchTemplatesBtn.style.display = "none";
    }
  });

  function displayTemplates(templates) {
    templateBrowserContainer.innerHTML = "";
    templates.forEach((template) => {
      const card = document.createElement("div");
      card.classList.add("template-card");
      card.innerHTML = `
                <img src="${template.url}" alt="${template.name}" loading="lazy">
                <p class="template-name">${template.name}</p>
                <button class="btn btn-secondary use-template-btn" data-url="${template.url}" data-name="${template.name}">Use This</button>
            `;
      templateBrowserContainer.appendChild(card);
    });
  }

  templateBrowserContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("use-template-btn")) {
      const name = e.target.getAttribute("data-name");
      const url = e.target.getAttribute("data-url");
      if (![...memeTemplateSelect.options].some((opt) => opt.value === url)) {
        const newOption = new Option(name, url);
        memeTemplateSelect.add(newOption);
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

  async function generateImage(endpoint, body) {
    showLoading(true);
    hideError();
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      resultImage.src = imageUrl;
      downloadBtn.href = imageUrl;
      resultDisplay.style.display = "block";
    } catch (error) {
      console.error("Error generating image:", error);
      showError(`Failed to generate image. ${error.message}`);
    } finally {
      showLoading(false);
    }
  }

  function showLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? "block" : "none";
    if (isLoading) resultDisplay.style.display = "none";
  }
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
  function hideError() {
    errorMessage.style.display = "none";
  }
});
