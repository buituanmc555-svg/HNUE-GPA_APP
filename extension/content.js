// HNUE GPA Extension — Content Script v3
// Scrapes the marks table including expanded detail component scores
// Table structure confirmed:
//   Main row: [0]STT [1]Mã môn [2]Tên môn [3]SốTC [4]Điểm10 [5]Điểm4 [6]ĐiểmChữ [7]KQ [8]GhiChú [9]ChiTiết
//   Detail sub-table: [0]STT [1]Tên thành phần [2]Trọng số [3]Điểm lần 1 [4]Điểm lần 2 [5]Điểm lần 3

(function () {
  'use strict';
  
  if (window._hnue_gpa_injected) return;
  window._hnue_gpa_injected = true;

  const EXCLUDE_PREFIXES = ['PHYE', 'PHYF', 'DEFE', 'DEFF', 'MIL'];
  function shouldExclude(code, name) {
    const isExcludedCode = EXCLUDE_PREFIXES.some(p => code?.toUpperCase().startsWith(p));
    const hasAsterisk = name && name.includes('*');
    return isExcludedCode || hasAsterisk;
  }

  function getLetterFrom10(score) {
    if (isNaN(score)) return 'B+';
    // Round to 1 decimal place with epsilon
    const rounded = Math.round((score + 0.0001) * 10) / 10;
    if (rounded >= 8.5) return 'A';
    if (rounded >= 7.8) return 'B+';
    if (rounded >= 7.0) return 'B';
    if (rounded >= 6.3) return 'C+';
    if (rounded >= 5.5) return 'C';
    if (rounded >= 4.8) return 'D+';
    if (rounded >= 4.0) return 'D';
    return 'F';
  }

  // Parse weight string like "60%" → 0.6
  function parseWeight(str) {
    const n = parseFloat(str);
    if (isNaN(n)) return null;
    return n > 1 ? n / 100 : n;
  }

  // Parse score from a cell — handles empty, comma decimals
  function parseScore(str) {
    if (!str || str.trim() === '' || str.trim() === '-') return null;
    return parseFloat(str.replace(',', '.'));
  }

  // ─── Click all expand buttons and wait ──────────────────────────────────
  async function expandAllDetails() {
    // Find all "Chi tiết" expand buttons that are collapsed (∨ icon)
    // On the HNUE page the button shows ∨ (collapsed) and ∧ (expanded)
    const expandBtns = Array.from(document.querySelectorAll(
      'table tbody tr td button, table tbody tr td [role="button"], table tbody tr td a'
    )).filter(btn => {
      const text = btn.textContent?.trim() || '';
      const title = btn.title || btn.getAttribute('aria-label') || '';
      // Collapsed buttons typically show ∨ or "Xem thêm" or down arrow
      return text.includes('∨') || text.includes('▼') || title.includes('Chi tiết') ||
             btn.querySelector('svg[class*="down"], svg[class*="expand"]');
    });

    // Also look for the last column buttons (Chi tiết column)
    const allRows = Array.from(document.querySelectorAll('table > tbody > tr'));
    const mainRows = allRows.filter(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 7) return false;
      const codeCell = cells[1]?.textContent?.trim() || '';
      return /^[A-Z]{2,6}\d{3,}/i.test(codeCell);
    });

    const initialTableCount = document.querySelectorAll('table table').length;
    let clickedCount = 0;
    
    for (const row of mainRows) {
      const lastCell = row.querySelector('td:last-child');
      
      // Look at the next row to see if it's already an expanded detail row
      const nextRow = row.nextElementSibling;
      const isExpanded = nextRow && nextRow.querySelector('table');

      if (!isExpanded && lastCell) {
        // Find the clickable element
        const btn = lastCell.querySelector('button, a, [role="button"]') || lastCell.firstElementChild || lastCell;
        
        // Prevent default navigation if it's an a tag
        if (btn.tagName && btn.tagName.toLowerCase() === 'a') {
          btn.addEventListener('click', (e) => { e.preventDefault(); }, { once: true });
        }
        
        // Use native click to ensure framework compatibility
        if (typeof btn.click === 'function') {
          btn.click();
        } else {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        }
        clickedCount++;
      }
    }

    if (clickedCount > 0) {
      // Smart Polling: Wait until new tables are inserted into the DOM, or timeout after 5.5 seconds.
      const targetTableCount = initialTableCount + clickedCount;
      let elapsed = 0;
      
      while (elapsed < 5500) {
        await new Promise(r => setTimeout(r, 200));
        elapsed += 200;
        
        const currentTableCount = document.querySelectorAll('table table').length;
        if (currentTableCount >= targetTableCount) {
          break; // All requested tables have been loaded
        }
      }
      
      // Extra tiny delay to let rendering and inner React/Vue states settle
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // ─── Parse detail sub-table for a subject ───────────────────────────────
  function parseDetailTable(detailRow) {
    const result = { scoreCC: null, scoreDK: null, scoreFinal: null,
                     weightCC: null, weightDK: null, weightFinal: null };

    const subTable = detailRow.querySelector('table');
    if (!subTable) return result;

    const rows = Array.from(subTable.querySelectorAll('tr'));
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < 3) continue;

      const compName = cells[1]?.textContent?.trim().toLowerCase() || '';
      const weightStr = cells[2]?.textContent?.trim() || '';
      // Score: try "Điểm lần 1" first, then "Điểm lần 2", "Điểm lần 3"
      let scoreStr = cells[3]?.textContent?.trim() || '';
      if (!scoreStr || scoreStr === '-') scoreStr = cells[4]?.textContent?.trim() || '';
      if (!scoreStr || scoreStr === '-') scoreStr = cells[5]?.textContent?.trim() || '';

      const weight = parseWeight(weightStr);
      const score = parseScore(scoreStr);

      if (compName.includes('chuyên cần') || compName.includes('cc')) {
        result.scoreCC = score;
        result.weightCC = weight;
      } else if (compName.includes('kt') || compName.includes('điều kiện') ||
                 compName.includes('kiểm tra') || compName.includes('giữa kỳ')) {
        result.scoreDK = score;
        result.weightDK = weight;
      } else if (compName.includes('thi') || compName.includes('cuối kỳ') ||
                 compName.includes('lý thuyết') || compName.includes('final')) {
        result.scoreFinal = score;
        result.weightFinal = weight;
      }
    }
    return result;
  }

  // ─── Main scrape function ────────────────────────────────────────────────
  function scrapeDOM() {
    const subjects = [];

    // Find grade table
    let gradeTable = null;
    for (const table of Array.from(document.querySelectorAll('table'))) {
      const text = table.querySelector('thead')?.textContent || '';
      if (text.includes('Mã môn') || text.includes('Mã học phần') ||
          text.includes('Tên môn') || text.includes('Số TC')) {
        gradeTable = table;
        break;
      }
      // Fallback: check first data row
      const firstTd = table.querySelector('tbody tr td:nth-child(2)');
      if (firstTd && /^[A-Z]{2,6}\d{3,}/i.test(firstTd.textContent?.trim())) {
        gradeTable = table;
        break;
      }
    }

    if (!gradeTable) return [];

    // Column positions (confirmed)
    let colCode = 1, colName = 2, colCredits = 3,
        colScore10 = 4, colScore4 = 5, colLetter = 6;

    const headerCells = Array.from(gradeTable.querySelectorAll('thead th, thead td'));
    headerCells.forEach((th, i) => {
      const lh = th.textContent?.trim().toLowerCase() || '';
      if (lh.includes('mã') && (lh.includes('môn') || lh.includes('học phần'))) colCode = i;
      else if (lh.includes('tên') && (lh.includes('môn') || lh.includes('học phần'))) colName = i;
      else if (lh === 'số tc' || lh === 'stc' || (lh.includes('số') && lh.includes('tc'))) colCredits = i;
      else if (lh.includes('hệ 10') || lh === 'điểm tb') colScore10 = i;
      else if (lh.includes('hệ 4')) colScore4 = i;
      else if (lh.includes('điểm chữ') || lh === 'xếp loại') colLetter = i;
    });

    const minCols = Math.max(colLetter + 1, 7);
    // SAFELY select only the direct children of the outer table's tbody to avoid matching inner detail tables
    const tbody = gradeTable.querySelector('tbody');
    if (!tbody) return [];
    const bodyRows = Array.from(tbody.children).filter(el => el.tagName.toLowerCase() === 'tr');

    let currentSemester = 'HK1';

    for (let i = 0; i < bodyRows.length; i++) {
      const row = bodyRows[i];
      const rowText = row.textContent?.trim() || '';

      // Check if this row is a semester header
      if (rowText.includes('Học kỳ:')) {
        const match = rowText.match(/Học kỳ:\s*(HK\d+)/i);
        if (match) {
          // Normalize HK01 to HK1
          currentSemester = match[1].toUpperCase().replace(/^HK0?/, 'HK');
        }
        continue;
      }

      const cells = Array.from(row.querySelectorAll('td'));

      // Skip non-subject rows
      if (cells.length < minCols) continue;

      const code = cells[colCode]?.textContent?.trim() || '';
      const name = cells[colName]?.textContent?.trim() || '';

      if (!code || !/^[A-Z]{2,6}\d{3,}/i.test(code)) continue;
      if (shouldExclude(code, name)) continue;

      const creditsRaw = cells[colCredits]?.textContent?.trim() || '';
      const credits = parseInt(creditsRaw);
      if (isNaN(credits) || credits < 1 || credits > 10) continue;

      // Overall grade from school's computed weighted average
      const score10Text = cells[colScore10]?.textContent?.trim() || '';
      const score10 = parseFloat(score10Text);
      const hasOverallScore = !isNaN(score10) && score10 > 0;

      const pageLetterRaw = cells[colLetter]?.textContent?.trim() || '';
      const validLetters = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
      const pageLetter = validLetters.includes(pageLetterRaw) ? pageLetterRaw : null;

      // Check if next row is a detail sub-table row
      const nextRow = bodyRows[i + 1];
      const detailData = (nextRow && nextRow.querySelector('table'))
        ? parseDetailTable(nextRow)
        : { scoreCC: null, scoreDK: null, scoreFinal: null,
            weightCC: null, weightDK: null, weightFinal: null };

      // Build subject object
      const id = `hnue_${code}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

      // Determine weights (from detail or defaults)
      const wCC    = detailData.weightCC    ?? 0.10;
      const wDK    = detailData.weightDK    ?? 0.30;
      const wFinal = detailData.weightFinal ?? 0.60;

      // Determine scores
      const sCC    = detailData.scoreCC;
      const sDK    = detailData.scoreDK;
      let sFinal   = detailData.scoreFinal;

      // Deduce missing final score if overall score is known and components are known
      if (sFinal === null && hasOverallScore && sCC !== null && sDK !== null && wFinal > 0) {
        sFinal = (score10 - (sCC * wCC) - (sDK * wDK)) / wFinal;
        sFinal = Math.round(sFinal * 10) / 10; // Fix floating point imprecision
        if (sFinal < 0) sFinal = 0;
        if (sFinal > 10) sFinal = 10;
      }

      const allComponentsKnown = sFinal !== null;
      const someComponentsKnown = sCC !== null || sDK !== null;

      if (hasOverallScore || allComponentsKnown) {
        // Subject is graded (either overall score or all components known)
        const sCC_val = sCC ?? 10;
        const sDK_val = sDK ?? 0;
        
        const finalWeightedScore = hasOverallScore ? score10 :
          (sCC_val * wCC + sDK_val * wDK + sFinal * wFinal);
        const achievedLetter = pageLetter || getLetterFrom10(finalWeightedScore);

        subjects.push({
          id, name: name || code, credits, semesterId: currentSemester,
          weightCC: wCC, weightDK: wDK, weightFinal: wFinal,
          scoreCC: sCC_val,
          scoreDK: sDK_val,
          scoreFinal: sFinal !== null ? sFinal : (hasOverallScore ? score10 : undefined),
          targetLetter: achievedLetter,
        });
      } else {
        // Pending subject — may have CC/DK scores available
        subjects.push({
          id, name: name || code, credits, semesterId: currentSemester,
          weightCC: wCC, weightDK: wDK, weightFinal: wFinal,
          scoreCC: sCC ?? 10,
          scoreDK: sDK ?? 0,
          scoreFinal: undefined,
          targetLetter: 'B+',
        });
      }
    }

    return subjects;
  }

  // ─── Message listener ────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'scrape_grades') {
      chrome.storage.local.get('hnue_fetched_subjects', result => {
        const cached = result.hnue_fetched_subjects;
        if (cached?.length > 0) {
          sendResponse({ subjects: cached, source: 'cache' });
        } else {
          const subjects = scrapeDOM();
          sendResponse({ subjects, source: 'dom' });
        }
      });
      return true;
    }

    if (msg.action === 'force_dom_scrape') {
      // Check if we are already scraping to prevent duplicate runs
      if (window._hnue_is_scraping) {
        sendResponse({ error: 'Đang tiến hành cào dữ liệu, vui lòng đợi...' });
        return true;
      }
      window._hnue_is_scraping = true;

      // Expand all detail rows first, then scrape
      expandAllDetails()
        .then(() => {
          try {
            const subjects = scrapeDOM();
            chrome.storage.local.set({ hnue_fetched_subjects: subjects });
            sendResponse({ subjects, source: 'dom' });
          } catch (e) {
            sendResponse({ error: e.message || 'Lỗi khi quét DOM' });
          }
        })
        .catch(err => {
          sendResponse({ error: err.message || 'Lỗi khi mở rộng chi tiết' });
        })
        .finally(() => {
          window._hnue_is_scraping = false;
        });
      return true;
    }
  });

  console.log('[HNUE GPA v3] Content script loaded — will expand details before scraping.');
})();
