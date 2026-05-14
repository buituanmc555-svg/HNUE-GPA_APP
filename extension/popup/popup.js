let fetchedSubjects = [];

const btnFetch = document.getElementById('btn-fetch');
const btnCopy = document.getElementById('btn-copy');
const statusEl = document.getElementById('status');
const statusText = document.getElementById('status-text');
const preview = document.getElementById('preview');

function setStatus(type, msg) {
  statusEl.className = `status-box ${type}`;
  const icons = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅' };
  statusEl.querySelector('.status-icon').textContent = icons[type] || 'ℹ️';
  statusText.textContent = msg;
}

function renderPreview(subjects) {
  preview.innerHTML = '';
  if (!subjects.length) return;

  const header = document.createElement('div');
  header.style.cssText = 'font-size:11px;color:#64748b;margin-bottom:6px;font-weight:600;';

  const graded = subjects.filter(s => s.scoreFinal !== undefined);
  const pending = subjects.filter(s => s.scoreFinal === undefined);
  header.textContent = `${subjects.length} môn: ${graded.length} đã có điểm · ${pending.length} chưa thi`;
  preview.appendChild(header);

  subjects.forEach(s => {
    const item = document.createElement('div');
    item.className = 'subject-item';

    const gradeText = s.scoreFinal !== undefined
      ? `<span style="color:#6ee7b7;font-weight:600;">${s.scoreFinal.toFixed(1)} ✓</span>`
      : `<span style="color:#64748b;">Chưa thi</span>`;

    item.innerHTML = `
      <div style="flex:1;min-width:0;">
        <div class="subj-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.name}</div>
        <div style="display:flex;gap:8px;margin-top:2px;">
          <span class="subj-code" style="color:#6ee7b7;">${s.id?.split('_')[1] || ''}</span>
          <span class="subj-credits" style="color:#64748b;">${s.credits} TC</span>
        </div>
      </div>
      ${gradeText}
    `;
    preview.appendChild(item);
  });
}

function scrapeGrades(tabId, callback) {
  // Cải tiến: Luôn bơm mã (inject) trực tiếp vào tab trước khi gửi tin nhắn 
  // để đảm bảo content script luôn tồn tại, ngay cả khi user không F5.
  chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js']
  }).then(() => {
    chrome.tabs.sendMessage(tabId, { action: 'force_dom_scrape' }, response => {
      if (chrome.runtime.lastError) {
        callback(null, 'Lỗi kết nối (' + chrome.runtime.lastError.message + '). Vui lòng F5 lại trang.');
      } else {
        chrome.storage.local.remove('hnue_fetched_subjects', () => {
          callback(response, null);
        });
      }
    });
  }).catch(err => {
    callback(null, 'Không thể truy cập trang web: ' + err.message);
  });
}

// Check current tab
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab) return;

  const isHNUE = tab.url?.includes('dtdh.hnue.edu.vn') || tab.url?.includes('hnue.edu.vn');

  if (!isHNUE) {
    setStatus('warn', 'Hãy mở trang dtdh.hnue.edu.vn/student/marks trước.');
    btnFetch.textContent = '🔗 Mở trang HNUE';
    btnFetch.disabled = false;
    btnFetch.onclick = () => chrome.tabs.create({ url: 'https://dtdh.hnue.edu.vn/student/marks' });
    return;
  }

  setStatus('info', 'Đang ở trang HNUE. Bấm "Lấy điểm" để cào bảng điểm.');
  btnFetch.disabled = false;

  btnFetch.onclick = () => {
    btnFetch.disabled = true;
    btnFetch.textContent = '⏳ Đang cào bảng điểm...';
    setStatus('info', 'Đang đọc bảng điểm từ trang...');

    scrapeGrades(tab.id, (response, err) => {
      btnFetch.disabled = false;
      btnFetch.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Lấy điểm từ trang này';

      if (err || !response) {
        setStatus('error', err || 'Không nhận được phản hồi. Hãy F5 lại trang.');
        return;
      }

      if (response.error) {
        setStatus('error', `Lỗi: ${response.error}`);
        return;
      }

      if (!response.subjects || response.subjects.length === 0) {
        setStatus('warn', 'Không tìm thấy môn nào. Hãy mở đúng trang "Kết quả học tập" và thử lại.');
        return;
      }

      fetchedSubjects = response.subjects;
      const graded = fetchedSubjects.filter(s => s.scoreFinal !== undefined).length;
      const pending = fetchedSubjects.filter(s => s.scoreFinal === undefined).length;

      setStatus('success', `Lấy được ${fetchedSubjects.length} môn! (${graded} đã có điểm · ${pending} chưa thi)`);
      btnCopy.disabled = false;
      renderPreview(fetchedSubjects);
    });
  };
});

btnCopy.onclick = () => {
  if (!fetchedSubjects.length) return;
  const json = JSON.stringify(fetchedSubjects, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    btnCopy.textContent = '✅ Đã sao chép!';
    setTimeout(() => { btnCopy.textContent = '📋 Sao chép JSON → dán vào App'; }, 2000);
  }).catch(() => {
    // Fallback: show in a text area
    const ta = document.createElement('textarea');
    ta.value = json;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btnCopy.textContent = '✅ Đã sao chép!';
    setTimeout(() => { btnCopy.textContent = '📋 Sao chép JSON → dán vào App'; }, 2000);
  });
};
