// CHUYỂN TAB GIAO DIỆN
function showTab(tabName) {
  ['home', 'bracket', 'matches', 'medals', 'news', 'photos', 'admin'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.add('hidden');
  });
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

// 1. LOAD TRẬN ĐẤU & DỮ LIỆU NHÁNH THI ĐẤU (BRACKET)
async function loadMatches() {
  const { data: matches, error } = await window.db
    .from('matches')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return;

  renderHomeLive(matches);
  renderAllMatches(matches);
  renderBracketTree(matches);
  renderAdminMatches(matches);
  populateNextMatchDropdown(matches);
}

// VẼ SƠ ĐỒ NHÁNH THI ĐẤU (TỨ KẾT ➔ BÁN KẾT ➔ CHUNG KẾT)
function renderBracketTree(matches) {
  const container = document.getElementById('bracket-tree');
  if (!matches || matches.length === 0) {
    container.innerHTML = '<p>Chưa có dữ liệu sơ đồ trận đấu.</p>';
    return;
  }

  const rounds = ['Tứ kết', 'Bán kết', 'Chung kết'];
  
  container.innerHTML = rounds.map(rName => {
    const roundMatches = matches.filter(m => m.round_name === rName);
    return `
      <div class="bracket-column">
        <div class="bracket-column-title">${rName.toUpperCase()}</div>
        ${roundMatches.length === 0 ? '<p style="text-align:center; font-size:0.8rem; color:#aaa;">Trống</p>' : ''}
        ${roundMatches.map(m => {
          const isEnded = m.status === 'Đã kết thúc';
          const winnerA = isEnded && m.score_a > m.score_b;
          const winnerB = isEnded && m.score_b > m.score_a;
          return `
            <div class="bracket-node">
              <small style="font-size:0.75rem; color:#666;">${m.sport_name}</small>
              <div class="bracket-team ${winnerA ? 'winner' : ''}">
                <span>${m.team_a || 'TBD'}</span>
                <span>${m.score_a}</span>
              </div>
              <div class="bracket-team ${winnerB ? 'winner' : ''}">
                <span>${m.team_b || 'TBD'}</span>
                <span>${m.score_b}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');
}

function renderHomeLive(matches) {
  const container = document.getElementById('live-matches-list');
  const liveMatches = matches.filter(m => m.status === 'Đang đấu' || m.live_url);
  
  if (liveMatches.length === 0) {
    container.innerHTML = '<p>Hiện chưa có trận đấu nào đang diễn ra/Live.</p>';
    return;
  }

  container.innerHTML = liveMatches.map(m => `
    <div class="match-item">
      <span class="status-badge badge-live">🔴 ĐANG LIVE</span>
      <small> | ${m.sport_name} - ${m.round_name}</small>
      <div class="score-board">
        <span>${m.team_a}</span>
        <span style="color:var(--accent);">${m.score_a} - ${m.score_b}</span>
        <span>${m.team_b}</span>
      </div>
      ${m.live_url ? `<p><a href="${m.live_url}" target="_blank" style="color:red; font-weight:bold;">👉 Click Vào Đây Để Xem Live Stream</a></p>` : ''}
    </div>
  `).join('');
}

function renderAllMatches(matches) {
  const container = document.getElementById('all-matches-list');
  container.innerHTML = matches.map(m => `
    <div class="match-item">
      <span class="status-badge ${m.status==='Đang đấu'?'badge-live':(m.status==='Đã kết thúc'?'badge-ended':'badge-upcoming')}">${m.status}</span>
      <strong> ${m.sport_name}</strong> (${m.round_name})
      <div class="score-board">
        <span>${m.team_a}</span>
        <span>${m.score_a} - ${m.score_b}</span>
        <span>${m.team_b}</span>
      </div>
      <small>📍 Sân: ${m.venue || 'Chưa xếp'} | ⏰ ${m.match_time || 'Chưa có giờ'}</small>
    </div>
  `).join('');
}

// 2. LOAD VÀ HIỂN THỊ HÌNH ẢNH
async function loadPhotos() {
  const { data: photos } = await window.db.from('photos').select('*').order('created_at', { ascending: false });
  const container = document.getElementById('photos-grid');
  if (!photos || photos.length === 0) {
    container.innerHTML = '<p>Chưa có hình ảnh nào trong thư viện.</p>';
    return;
  }
  container.innerHTML = photos.map(p => `
    <div class="photo-card">
      <img src="${p.image_url}" alt="Ảnh HKPĐ" onclick="window.open('${p.image_url}')">
      <p>${p.caption || 'Hình ảnh HKPĐ'}</p>
    </div>
  `).join('');
}

// 3. LOAD TIN TỨC
async function loadNews() {
  const { data: news } = await window.db.from('news').select('*').order('created_at', { ascending: false });
  const container = document.getElementById('news-list');
  const adminContainer = document.getElementById('admin-news-list');

  if (!news || news.length === 0) {
    container.innerHTML = '<p>Chưa có bài viết mới.</p>';
    if (adminContainer) adminContainer.innerHTML = '<p>Chưa có bài viết.</p>';
    return;
  }

  container.innerHTML = news.map(n => `
    <div class="match-item">
      <h4 style="margin:0 0 5px; color:var(--primary);">${n.title}</h4>
      <p style="margin:0; font-size:0.95rem;">${n.content}</p>
      <small style="color:#888;">🕒 ${new Date(n.created_at).toLocaleDateString('vi-VN')}</small>
    </div>
  `).join('');

  if (adminContainer) {
    adminContainer.innerHTML = news.map(n => `
      <div class="match-item" style="display:flex; justify-content:space-between; align-items:center;">
        <div><strong>${n.title}</strong></div>
        <button class="btn-delete" onclick="deleteNews('${n.id}')">Xóa Bài</button>
      </div>
    `).join('');
  }
}

// 4. LOAD HUY CHƯƠNG
async function loadMedals() {
  const { data: medals } = await window.db.from('medals').select('*');
  if (!medals) return;

  medals.sort((a,b) => (b.gold*100 + b.silver*10 + b.bronze) - (a.gold*100 + a.silver*10 + a.bronze));

  document.getElementById('medals-table-body').innerHTML = medals.map(m => `
    <tr>
      <td><strong>${m.class_name}</strong></td>
      <td>🥇 ${m.gold}</td>
      <td>🥈 ${m.silver}</td>
      <td>🥉 ${m.bronze}</td>
      <td><strong>${m.gold + m.silver + m.bronze}</strong></td>
    </tr>
  `).join('');

  document.getElementById('home-medals-list').innerHTML = `
    <table>
      <tr><th>Lớp</th><th>🥇</th><th>🥈</th><th>🥉</th></tr>
      ${medals.slice(0,5).map(m => `<tr><td>${m.class_name}</td><td>${m.gold}</td><td>${m.silver}</td><td>${m.bronze}</td></tr>`).join('')}
    </table>
  `;
}

// 5. CÁC TÍNH NĂNG DÀNH CHO ADMIN
async function createMatch() {
  const sport_name = document.getElementById('m-sport').value;
  const round_name = document.getElementById('m-round').value;
  const team_a = document.getElementById('m-teama').value;
  const team_b = document.getElementById('m-teamb').value;
  const match_time = document.getElementById('m-time').value;
  const venue = document.getElementById('m-venue').value;
  const next_match_id = document.getElementById('m-next-match').value || null;
  const next_slot = document.getElementById('m-next-slot').value;

  const { error } = await window.db.from('matches').insert([{ 
    sport_name, round_name, team_a, team_b, match_time, venue, next_match_id, next_slot 
  }]);
  if (!error) {
    alert('Đã thêm trận đấu thành công!');
    loadMatches();
  } else {
    alert('Lỗi: ' + error.message);
  }
}

function renderAdminMatches(matches) {
  const container = document.getElementById('admin-matches-list');
  container.innerHTML = matches.map(m => `
    <div class="match-item" style="background:#f8fafc;">
      <div style="display:flex; justify-content:space-between;">
        <strong>${m.sport_name} - ${m.round_name}</strong>
        <button class="btn-delete" onclick="deleteMatch('${m.id}')">🗑 Xóa Trận</button>
      </div>
      <div style="margin:5px 0;">${m.team_a} VS ${m.team_b}</div>
      <div style="display:flex; gap:5px; margin:5px 0;">
        <input type="number" id="sa-${m.id}" value="${m.score_a}" placeholder="Điểm A" style="width:50%;">
        <input type="number" id="sb-${m.id}" value="${m.score_b}" placeholder="Điểm B" style="width:50%;">
      </div>
      <select id="st-${m.id}">
        <option value="Sắp đấu" ${m.status==='Sắp đấu'?'selected':''}>Sắp đấu</option>
        <option value="Đang đấu" ${m.status==='Đang đấu'?'selected':''}>🔴 Đang đấu</option>
        <option value="Đã kết thúc" ${m.status==='Đã kết thúc'?'selected':''}>Đã kết thúc</option>
      </select>
      <input type="text" id="live-${m.id}" value="${m.live_url||''}" placeholder="Link Livestream (YouTube/FB)">
      <button class="btn btn-submit" onclick="updateMatchScore('${m.id}')">Lưu Thay Đổi Trận Này</button>
    </div>
  `).join('');
}

function populateNextMatchDropdown(matches) {
  const select = document.getElementById('m-next-match');
  select.innerHTML = '<option value="">-- Không chuyển / Trận Chung kết --</option>' + 
    matches.map(m => `<option value="${m.id}">Chuyển đội thắng tới: ${m.sport_name} (${m.round_name}: ${m.team_a||'?'} vs ${m.team_b||'?'})</option>`).join('');
}

// XÓA TRẬN ĐẤU
async function deleteMatch(id) {
  if (confirm('Thầy có chắc chắn muốn XÓA trận đấu này không?')) {
    const { error } = await window.db.from('matches').delete().eq('id', id);
    if (!error) {
      alert('Đã xóa trận đấu!');
      loadMatches();
    }
  }
}

// CẬP NHẬT TỶ SỐ & ĐẨY ĐỘI THẮNG VÀO TRẬN KẾ TIẾP
async function updateMatchScore(id) {
  const score_a = parseInt(document.getElementById(`sa-${id}`).value) || 0;
  const score_b = parseInt(document.getElementById(`sb-${id}`).value) || 0;
  const status = document.getElementById(`st-${id}`).value;
  const live_url = document.getElementById(`live-${id}`).value;

  const { error } = await window.db.from('matches').update({ score_a, score_b, status, live_url }).eq('id', id);
  if (!error) {
    alert('Cập nhật trận đấu thành công!');
    loadMatches();
  }
}

// THÊM HÌNH ẢNH MỚI
async function addPhoto() {
  const image_url = document.getElementById('img-url').value;
  const caption = document.getElementById('img-caption').value;

  if (!image_url) {
    alert('Vui lòng nhập đường link hình ảnh!');
    return;
  }

  const { error } = await window.db.from('photos').insert([{ image_url, caption }]);
  if (!error) {
    alert('Đã thêm ảnh vào thư viện!');
    document.getElementById('img-url').value = '';
    document.getElementById('img-caption').value = '';
    loadPhotos();
  }
}

// THÊM & XÓA BÀI VIẾT
async function addNews() {
  const title = document.getElementById('news-title').value;
  const content = document.getElementById('news-content').value;

  const { error } = await window.db.from('news').insert([{ title, content }]);
  if (!error) {
    alert('Đăng bài viết thành công!');
    document.getElementById('news-title').value = '';
    document.getElementById('news-content').value = '';
    loadNews();
  }
}

async function deleteNews(id) {
  if (confirm('Xóa bài viết này?')) {
    const { error } = await window.db.from('news').delete().eq('id', id);
    if (!error) {
      alert('Đã xóa bài!');
      loadNews();
    }
  }
}

// HUY CHƯƠNG
async function updateMedal() {
  const class_name = document.getElementById('med-class').value;
  const gold = parseInt(document.getElementById('med-gold').value) || 0;
  const silver = parseInt(document.getElementById('med-silver').value) || 0;
  const bronze = parseInt(document.getElementById('med-bronze').value) || 0;

  const { data: existing } = await window.db.from('medals').select('*').eq('class_name', class_name).single();

  if (existing) {
    await window.db.from('medals').update({
      gold: existing.gold + gold,
      silver: existing.silver + silver,
      bronze: existing.bronze + bronze
    }).eq('class_name', class_name);
  } else {
    await window.db.from('medals').insert([{ class_name, gold, silver, bronze }]);
  }
  alert('Đã cập nhật bảng huy chương!');
  loadMedals();
}

// AUTH & REALTIME
async function loginAdmin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-pass').value;

  const { error } = await window.db.auth.signInWithPassword({ email, password });
  if (error) alert('Đăng nhập thất bại: ' + error.message);
  else checkAdminAuth();
}

async function logoutAdmin() {
  await window.db.auth.signOut();
  checkAdminAuth();
}

async function checkAdminAuth() {
  const { data: { user } } = await window.db.auth.getUser();
  if (user) {
    document.getElementById('admin-login-card').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
  } else {
    document.getElementById('admin-login-card').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
  }
}

function setupRealtime() {
  window.db.channel('public-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => loadMatches())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'medals' }, () => loadMedals())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => loadNews())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => loadPhotos())
    .subscribe();
}

window.onload = () => {
  checkAdminAuth();
  loadMatches();
  loadMedals();
  loadNews();
  loadPhotos();
  setupRealtime();
};