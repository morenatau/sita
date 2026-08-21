(function () {
  var selectedFiles = [];

  function populateTenderOptions() {
    var select = document.getElementById('submitTender');
    if (!select) return;
    var rows = document.querySelectorAll('.tender-listing-table tbody tr');
    rows.forEach(function (row) {
      var numberCell = row.querySelector('[data-label="Tender Number"]');
      var descCell = row.querySelector('[data-label="Description"]');
      if (!numberCell) return;
      var number = numberCell.textContent.trim();
      var desc = descCell ? descCell.textContent.replace(/Published Date:.*?(\d{4})/, '').trim() : '';
      var shortDesc = desc.length > 70 ? desc.slice(0, 70) + '…' : desc;
      var opt = document.createElement('option');
      opt.value = number;
      opt.textContent = number + ' — ' + shortDesc;
      opt.dataset.desc = desc;
      select.appendChild(opt);
    });
  }

  function slugify(s) {
    return (s || '').toString().trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'na';
  }

  function renderFileList() {
    var list = document.getElementById('submitFileList');
    if (!list) return;
    list.innerHTML = '';
    selectedFiles.forEach(function (file, i) {
      var item = document.createElement('div');
      item.className = 'submit-file-item';
      var nameSpan = document.createElement('span');
      nameSpan.textContent = file.name + ' (' + Math.round(file.size / 1024) + ' KB)';
      var removeSpan = document.createElement('span');
      removeSpan.className = 'remove-file';
      removeSpan.textContent = '× Remove';
      removeSpan.addEventListener('click', function () {
        selectedFiles.splice(i, 1);
        renderFileList();
      });
      item.appendChild(nameSpan);
      item.appendChild(removeSpan);
      list.appendChild(item);
    });
  }

  function addFiles(fileList) {
    Array.prototype.forEach.call(fileList, function (f) { selectedFiles.push(f); });
    renderFileList();
  }

  function initDropzone() {
    var zone = document.getElementById('submitDropzone');
    var browseBtn = document.getElementById('submitBrowseBtn');
    var input = document.getElementById('submitFileInput');
    if (!zone) return;

    browseBtn.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      addFiles(input.files);
      input.value = '';
    });

    zone.addEventListener('dragover', function (e) {
      e.preventDefault();
      zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', function () {
      zone.classList.remove('dragover');
    });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('dragover');
      addFiles(e.dataTransfer.files);
    });
  }

  function setStatus(msg, type) {
    var el = document.getElementById('submitStatus');
    if (!el) return;
    el.textContent = msg;
    el.className = 'submit-status-msg' + (type ? ' ' + type : '');
  }

  function resetForm() {
    selectedFiles = [];
    renderFileList();
    document.getElementById('submitTender').value = '';
    document.getElementById('submitCompany').value = '';
    document.getElementById('submitCipc').value = '';
    document.getElementById('submitContact').value = '';
    document.getElementById('submitEmail').value = '';
  }

  function initSubmit() {
    var btn = document.getElementById('submitBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var tender = document.getElementById('submitTender').value;
      var company = document.getElementById('submitCompany').value.trim();
      var cipc = document.getElementById('submitCipc').value.trim();
      var contact = document.getElementById('submitContact').value.trim();
      var email = document.getElementById('submitEmail').value.trim();
      var category = document.getElementById('submitCategory').value;

      if (!tender || !company || !cipc || !contact || !email || !category) {
        setStatus('Please fill in all required fields.', 'error');
        return;
      }
      if (selectedFiles.length === 0) {
        setStatus('Please attach at least one document.', 'error');
        return;
      }
      if (typeof supabaseClient === 'undefined') {
        setStatus('Submission service is unavailable right now. Please try again later.', 'error');
        return;
      }

      btn.disabled = true;
      setStatus('Uploading ' + selectedFiles.length + ' file(s)…');

      var tenderOpt = document.getElementById('submitTender').selectedOptions[0];
      var tenderDesc = tenderOpt ? (tenderOpt.dataset.desc || '') : '';
      var folder = slugify(tender) + '/' + slugify(company) + '-' + Date.now() + '/' + slugify(category);

      var uploads = selectedFiles.map(function (file) {
        var path = folder + '/' + file.name;
        return supabaseClient.storage.from(SUBMISSIONS_BUCKET)
          .upload(path, file, { upsert: false })
          .then(function (res) { return { res: res, path: path }; });
      });

      Promise.all(uploads).then(function (results) {
        var failed = results.filter(function (r) { return r.res.error; });
        if (failed.length) {
          setStatus('Some files failed to upload: ' + failed.map(function (f) { return f.res.error.message; }).join('; '), 'error');
          btn.disabled = false;
          return;
        }
        var filePaths = results.map(function (r) { return r.path; });
        // Plain supabase-js .insert() asks PostgREST to hand the row back
        // (Prefer: return=representation), which requires a SELECT policy —
        // bidders deliberately don't have one, so that always fails with a
        // row-level-security error even though the insert itself is fine.
        // Fetching directly with return=minimal sidesteps that.
        return fetch(SUPABASE_URL + '/rest/v1/tender_submissions_meta', {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            tender_number: tender,
            tender_description: tenderDesc,
            company_name: company,
            cipc_number: cipc,
            contact_name: contact,
            contact_email: email,
            category: category,
            file_paths: filePaths
          })
        }).then(function (resp) {
          if (!resp.ok) {
            return resp.json().catch(function () { return {}; }).then(function (body) {
              throw new Error(body.message || ('HTTP ' + resp.status));
            });
          }
          setStatus('Submission received. Thank you, ' + contact + ' — your documents for ' + tender + ' were uploaded successfully.', 'success');
          resetForm();
          btn.disabled = false;
        }).catch(function (err) {
          setStatus('Files uploaded, but the submission record failed to save: ' + err.message + '. Please contact the Tender Office directly.', 'error');
          btn.disabled = false;
        });
      }).catch(function (err) {
        setStatus('Upload failed: ' + err.message, 'error');
        btn.disabled = false;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    populateTenderOptions();
    initDropzone();
    initSubmit();
  });
})();
