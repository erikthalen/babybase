import { html } from "hono/html";
import { iconUpload } from "../../index.ts";

// Self-contained IIFE. Reads upload URL from zone's data-upload-url attribute.
// File type validation is driven by the accept attribute on the paired input.
// Dispatches custom events on the zone element:
//   upload-zone:success  — detail: { file: File, response: Response }
//   upload-zone:error    — detail: { message: string }
export const uploadZoneScript = `(function () {
  var zone = document.getElementById("upload-zone");
  var input = document.getElementById("upload-input");
  if (!zone || !input) return;
  var url = zone.dataset.uploadUrl;

  function dispatch(name, detail) {
    zone.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail }));
  }

  function validate(file) {
    var accept = input.accept;
    if (!accept) return true;
    var exts = accept.split(",").map(function (s) { return s.trim().replace(/^\\./, "").toLowerCase(); });
    var ext = file.name.split(".").pop().toLowerCase();
    return exts.indexOf(ext) !== -1;
  }

  function doUpload(file) {
    if (!validate(file)) {
      dispatch("upload-zone:error", { message: "Invalid file type. Accepted: " + input.accept });
      return;
    }
    var fd = new FormData();
    fd.append("file", file);
    zone.classList.add("uploading");
    fetch(url, { method: "POST", body: fd })
      .then(function (r) {
        if (r.ok) {
          dispatch("upload-zone:success", { file: file, response: r });
        } else {
          dispatch("upload-zone:error", { message: "Upload failed (" + r.status + ")" });
        }
      })
      .catch(function () {
        dispatch("upload-zone:error", { message: "Upload failed" });
      })
      .finally(function () {
        zone.classList.remove("uploading");
      });
  }

  zone.addEventListener("dragover", function (e) {
    e.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", function () {
    zone.classList.remove("drag-over");
  });
  zone.addEventListener("drop", function (e) {
    e.preventDefault();
    zone.classList.remove("drag-over");
    var file = e.dataTransfer && e.dataTransfer.files[0];
    if (file) doUpload(file);
  });
  input.addEventListener("change", function () {
    if (input.files && input.files[0]) doUpload(input.files[0]);
    input.value = "";
  });
})();`;

export const uploadZoneExample = {
  description:
    "Drag-and-drop file upload zone. Use as a <label> paired with a hidden file input, or any block element.",

  preview: html`
    <label class="upload-zone" style="margin-top:0;">
      ${iconUpload(24)}
      <span class="upload-zone-title">Drag &amp; drop a file here</span>
      <span class="upload-zone-subtitle">or click to select</span>
    </label>`,

  markup: html`<input type="file" id="upload-input" accept=".db,.sqlite" style="display:none" />
<label for="upload-input" id="upload-zone" class="upload-zone" data-upload-url="/upload">
  <!-- upload icon -->
  <span class="upload-zone-title">Drag &amp; drop a file here</span>
  <span class="upload-zone-subtitle">or click to select</span>
</label>`,

  usage: `import { uploadZoneScript } from "@babybase/ui";
import { html, raw } from "hono/html";

// Inline the script after your upload zone markup.
// Then listen for custom events to handle success and error:
html\`
  <script>\${raw(uploadZoneScript)}</script>
  <script>
    document.getElementById("upload-zone").addEventListener("upload-zone:success", function () {
      window.location.reload();
    });
    document.getElementById("upload-zone").addEventListener("upload-zone:error", function (e) {
      console.error(e.detail.message);
    });
  </script>
\``,
};
