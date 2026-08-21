(function () {
  var ADMIN_EMAIL = 'admin@sita-ct.co.za';
  var currentStatusFilter = '';

  function el(id) { return document.getElementById(id); }

  function showDashboard() {
    var loginWrap = el('adminLoginWrap');
    var dash = el('adminDashboard');
    if (!loginWrap || !dash) return;
    loginWrap.style.display = 'none';
    dash.style.display = 'block';
    loadSubmissions();
  }

  function showLogin() {
    var loginWrap = el('adminLoginWrap');
    var dash = el('adminDashboard');
    if (!loginWrap || !dash) return;
    loginWrap.style.display = 'block';
    dash.style.display = 'none';
  }

  function setLoginStatus(msg, type) {
    var elm = el('adminLoginStatus');
    if (!elm) return;
    elm.textContent = msg;
    elm.className = 'submit-status-msg' + (type ? ' ' + type : '');
  }

  function checkSession() {
    if (typeof supabaseClient === 'undefined' || !el('page-admin')) return;
    supabaseClient.auth.getSession().then(function (result) {
      var session = result.data && result.data.session;
      if (session && session.user && session.user.email === ADMIN_EMAIL) {
        showDashboard();
      } else {
        showLogin();
      }
    });
  }

  function initLogin() {
    var btn = el('adminLoginBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var email = el('adminEmail').value.trim();
      var password = el('adminPassword').value;
      if (!email || !password) {
        setLoginStatus('Enter your email and password.', 'error');
        return;
      }
      btn.disabled = true;
      setLoginStatus('Signing in…');
      supabaseClient.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
        btn.disabled = false;
        if (res.error) {
          setLoginStatus(res.error.message, 'error');
          return;
        }
        if (res.data.user.email !== ADMIN_EMAIL) {
          supabaseClient.auth.signOut();
          setLoginStatus('This account is not authorized to view submissions.', 'error');
          return;
        }
        setLoginStatus('');
        el('adminPassword').value = '';
        showDashboard();
      });
    });

    el('adminPassword').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') btn.click();
    });
  }

  function initLogout() {
    var btn = el('adminLogoutBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      supabaseClient.auth.signOut().then(function () { showLogin(); });
    });
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }

  function statusOptionsHtml(current) {
    var statuses = ['Received', 'Under Review', 'Shortlisted', 'Rejected', 'Awarded'];
    return statuses.map(function (s) {
      return '<option value="' + s + '"' + (s === current ? ' selected' : '') + '>' + s + '</option>';
    }).join('');
  }

  function renderRows(rows) {
    var body = el('adminSubmissionsBody');
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="9" class="admin-empty">No submissions found.</td></tr>';
      return;
    }
    body.innerHTML = '';
    rows.forEach(function (row) {
      var tr = document.createElement('tr');

      var ref = 'SUB-' + String(row.id).padStart(6, '0');
      var fileCount = (row.file_paths || []).length;

      tr.innerHTML =
        '<td>' + ref + '</td>' +
        '<td>' + escapeHtml(row.tender_number) + '</td>' +
        '<td>' + escapeHtml(row.company_name) + '</td>' +
        '<td>' + escapeHtml(row.category) + '</td>' +
        '<td>' + escapeHtml(row.contact_name) + '<br><span class="admin-muted">' + escapeHtml(row.contact_email) + '</span></td>' +
        '<td><button type="button" class="admin-link-btn admin-view-files" data-id="' + row.id + '">' + fileCount + ' file' + (fileCount === 1 ? '' : 's') + '</button>' +
        '<div class="admin-file-links" id="adminFiles' + row.id + '" style="display:none;"></div></td>' +
        '<td><select class="admin-status-select" data-id="' + row.id + '">' + statusOptionsHtml(row.status) + '</select></td>' +
        '<td>' + formatDate(row.created_at) + '</td>' +
        '<td class="admin-muted">&mdash;</td>';

      body.appendChild(tr);
    });

    body.querySelectorAll('.admin-status-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var id = sel.dataset.id;
        supabaseClient.from('tender_submissions_meta').update({ status: sel.value }).eq('id', id).then(function (res) {
          if (res.error) { alert('Failed to update status: ' + res.error.message); }
        });
      });
    });

    body.querySelectorAll('.admin-view-files').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.id;
        var container = el('adminFiles' + id);
        var row = rows.filter(function (r) { return String(r.id) === String(id); })[0];
        if (!row) return;
        if (container.style.display === 'block') {
          container.style.display = 'none';
          return;
        }
        container.innerHTML = 'Loading links…';
        container.style.display = 'block';
        var paths = row.file_paths || [];
        Promise.all(paths.map(function (p) {
          return supabaseClient.storage.from(SUBMISSIONS_BUCKET).createSignedUrl(p, 3600);
        })).then(function (results) {
          container.innerHTML = '';
          results.forEach(function (r, i) {
            var a = document.createElement('a');
            if (r.error || !r.data) {
              a.textContent = paths[i].split('/').pop() + ' (link failed)';
            } else {
              a.href = r.data.signedUrl;
              a.target = '_blank';
              a.rel = 'noopener';
              a.textContent = paths[i].split('/').pop();
            }
            container.appendChild(a);
            container.appendChild(document.createElement('br'));
          });
        });
      });
    });
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s == null ? '' : s;
    return div.innerHTML;
  }

  function loadSubmissions() {
    var body = el('adminSubmissionsBody');
    body.innerHTML = '<tr><td colspan="9" class="admin-empty">Loading…</td></tr>';
    var query = supabaseClient.from('tender_submissions_meta').select('*').order('created_at', { ascending: false });
    if (currentStatusFilter) query = query.eq('status', currentStatusFilter);
    query.then(function (res) {
      if (res.error) {
        body.innerHTML = '<tr><td colspan="9" class="admin-empty">Failed to load: ' + escapeHtml(res.error.message) + '</td></tr>';
        return;
      }
      el('adminSubCount').textContent = res.data.length + ' submission' + (res.data.length === 1 ? '' : 's');
      renderRows(res.data);
    });
  }

  function initToolbar() {
    var refreshBtn = el('adminRefreshBtn');
    var filter = el('adminStatusFilter');
    if (refreshBtn) refreshBtn.addEventListener('click', loadSubmissions);
    if (filter) filter.addEventListener('change', function () {
      currentStatusFilter = filter.value;
      loadSubmissions();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLogin();
    initLogout();
    initToolbar();
    checkSession();
  });
})();
