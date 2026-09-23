import React, { useState, useEffect } from 'react';
import { contentStore } from '../../engine/contentStore';

const ADMIN_SECRET = 'robin123';

const QUESTION_JSON_SCHEMA_EXAMPLE = {
  id: 'Q21',
  title: 'ROOM 21: THE QUANTUM ENCRYPTION PROTOCOL',
  subtitle: 'Asymmetric Cryptosystems & Public Key Infrastructure',
  category: 'Computer Systems',
  difficulty: 'Medium',
  enabled: true,
  investigationType: 'code',
  story: [
    '<strong>[ALERT] LATVERIA-NET ENCRYPTED TELEMETRY STREAM</strong>',
    'Doctor Doom secures inter-realm telemetry using mathematical trapdoor functions.',
    'The system relies on a public key (e, n) for encryption and a private key (d, n) for decryption based on prime factor decomposition.',
    'Name this foundational asymmetric cryptosystem algorithm.'
  ],
  codeLines: [
    '// Public Encryption Key: (e, n)',
    '// Private Decryption Key: (d, n)',
    'ciphertext = (message ** e) % n',
    'plaintext  = (ciphertext ** d) % n'
  ],
  question: 'What asymmetric cryptosystem uses public and private key pairs based on prime factorization? Transmit \'RSA\'.',
  hints: [
    { text: 'This algorithm is named after creators Rivest, Shamir, and Adleman.', penalty: 20 },
    { text: 'It is the world\'s most prominent public-key asymmetric algorithm.', penalty: 40 },
    { text: 'Type \'RSA\' to decrypt the telemetry channel.', penalty: 60 }
  ],
  fragment: 21,
  evidenceTitle: 'RSA Asymmetric Key Schema Blueprint',
  consequence: [
    'CIPHER OVERRIDDEN',
    'RSA asymmetric key verified! Telemetry channel unlocked.'
  ],
  keywords: ['RSA', 'ASYMMETRIC', 'RIVEST']
};

export const AdminPanel = ({ isOpen, onClose, adminToken: propAdminToken }) => {
  const [content, setContent] = useState(() => contentStore.getContent());
  const [activeTab, setActiveTab] = useState('event_control'); // event_control | leaderboard | bank | doom
  const [eventProgress, setEventProgress] = useState({ eventState: {}, totalParticipants: 0, participants: [], leaderboard: [] });
  const [questionBank, setQuestionBank] = useState([]);
  const [selectedBankQId, setSelectedBankQId] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [saveToast, setSaveToast] = useState(null);
  const [adminToken, setAdminToken] = useState(() => propAdminToken || ADMIN_SECRET);
  const [durationInput, setDurationInput] = useState(60);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [mongoStatus, setMongoStatus] = useState({ connected: false, uri: '' });

  // Participant Credentials State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamPassword, setNewTeamPassword] = useState('');
  const [editingParticipantId, setEditingParticipantId] = useState(null);
  const [editTeamPassword, setEditTeamPassword] = useState('');
  const [credentialsSearch, setCredentialsSearch] = useState('');

  // Modals
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState(null);

  const [newQuestionData, setNewQuestionData] = useState({
    id: '',
    title: '',
    subtitle: '',
    category: 'Computer Systems',
    difficulty: 'Medium',
    investigationType: 'code',
    question: '',
    keywords: '',
    story: ['Classified incident report logged in Latveria-Net.'],
    codeLines: ['// Code verification script\nexecute_security_check();']
  });

  useEffect(() => {
    if (propAdminToken) {
      setAdminToken(propAdminToken);
    }
  }, [propAdminToken]);

  // Poll live progress when Admin is open
  const fetchAdminProgress = async () => {
    try {
      const res = await fetch('/api/admin/progress', {
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json();
      if (data && data.success) {
        setEventProgress(data);
        if (data.eventState?.session_duration_minutes) {
          setDurationInput(data.eventState.session_duration_minutes);
        }
      }
    } catch (err) {
      console.warn('[Admin] Failed to fetch admin progress:', err);
    }
  };

  const fetchMongoStatus = async () => {
    try {
      const res = await fetch('/api/admin/db/status', {
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json();
      if (data && data.success) {
        setMongoStatus({ connected: data.mongoConnected, uri: data.mongoUri, stats: data.stats });
      }
    } catch (err) {
      console.warn('[Admin] Failed to fetch mongo status:', err);
    }
  };

  const fetchQuestionBank = async () => {
    try {
      const res = await fetch('/api/admin/questions', {
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json();
      if (data && data.questions) {
        setQuestionBank(data.questions);
        if (!selectedBankQId && data.questions.length > 0) {
          setSelectedBankQId(data.questions[0].id);
        }
      }
    } catch (err) {
      console.warn('[Admin] Failed to fetch question bank:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchAdminProgress();
    fetchQuestionBank();
    fetchMongoStatus();

    // Listen to real-time events for instant admin dashboard updates
    let eventSource = null;
    try {
      eventSource = new EventSource('/api/events/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type) {
            fetchAdminProgress();
            fetchMongoStatus();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isOpen, adminToken]);

  useEffect(() => {
    if (saveToast) {
      const t = setTimeout(() => setSaveToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [saveToast]);

  if (!isOpen) return null;

  const notifySaved = (msg = 'ACTION EXECUTED & STORED') => {
    setSaveToast(msg);
  };

  const handleSyncMongo = async () => {
    try {
      notifySaved('SYNCING DATABASE WITH MONGODB...');
      const res = await fetch('/api/admin/db/sync', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json();
      if (data && data.success) {
        notifySaved('✅ ' + data.message);
        fetchMongoStatus();
        fetchAdminProgress();
      } else {
        notifySaved('[ALERT] ' + (data?.message || 'Sync failed.'));
      }
    } catch (err) {
      notifySaved('[ALERT] Network error during sync.');
    }
  };

  // ─── EVENT CONTROL HANDLERS ───
  const handleUpdateEventState = async (newStatus) => {
    try {
      const res = await fetch('/api/admin/event/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ status: newStatus, durationMinutes: Number(durationInput) || 60 })
      });
      const data = await res.json();
      if (data.success) {
        notifySaved(`EVENT STATUS UPDATED TO ${newStatus}`);
        fetchAdminProgress();
      }
    } catch (err) {
      console.error('[Admin] State update failed:', err);
    }
  };

  const handleAdjustTimer = async (params) => {
    try {
      const res = await fetch('/api/admin/event/adjust-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success) {
        if (params.minutes) {
          notifySaved(`TIMER ADJUSTED BY ${params.minutes > 0 ? '+' : ''}${params.minutes} MIN`);
        } else if (params.durationMinutes) {
          notifySaved(`SESSION DURATION SET TO ${params.durationMinutes} MIN`);
        } else if (params.action) {
          notifySaved(`TIMER ${params.action.toUpperCase()}ED`);
        }
        fetchAdminProgress();
      }
    } catch (err) {
      console.error('[Admin] Timer adjustment failed:', err);
    }
  };

  const handleResetCompetition = async () => {
    if (window.confirm('[ALERT] DANGER: Reset all participants, scores, hint penalties, and timers for the entire competition?')) {
      try {
        const res = await fetch('/api/admin/event/reset', {
          method: 'POST',
          headers: { 'x-admin-token': adminToken }
        });
        const data = await res.json();
        if (data.success) {
          notifySaved('COMPETITION FULLY RESET (ALL TEAMS CLEARED)');
          fetchAdminProgress();
        }
      } catch (err) {
        console.error('[Admin] Reset failed:', err);
      }
    }
  };

  // ─── PARTICIPANT CREDENTIAL HANDLERS ───
  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewTeamPassword(`PASS-${code}`);
  };

  const parseJsonResponse = async (res) => {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    throw new Error(`Server returned HTML instead of JSON (Status ${res.status}). Please restart your terminal server ('npm run dev') to load updated API routes.`);
  };

  const handleCreateParticipantCredentials = async (e) => {
    if (e) e.preventDefault();
    if (!newTeamName.trim()) {
      alert('Please enter a team name.');
      return;
    }
    if (!newTeamPassword.trim()) {
      alert('Please enter a team password.');
      return;
    }

    try {
      const res = await fetch('/api/admin/participant/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ teamName: newTeamName.trim(), teamPassword: newTeamPassword.trim() })
      });
      const data = await parseJsonResponse(res);
      if (res.ok && data.success) {
        notifySaved(`✅ CREATED CREDENTIALS FOR '${data.participant.teamName}'`);
        setNewTeamName('');
        setNewTeamPassword('');
        fetchAdminProgress();
      } else {
        alert(data.message || data.error || 'Failed to create credentials.');
      }
    } catch (err) {
      alert('Error creating credentials: ' + err.message);
    }
  };

  const handleUpdateParticipantPassword = async (participantId) => {
    if (!editTeamPassword.trim()) {
      alert('Password cannot be empty.');
      return;
    }

    try {
      const res = await fetch('/api/admin/participant/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ participantId, teamPassword: editTeamPassword.trim() })
      });
      const data = await parseJsonResponse(res);
      if (res.ok && data.success) {
        notifySaved(`✅ PASSWORD UPDATED FOR '${data.participant.teamName}'`);
        setEditingParticipantId(null);
        setEditTeamPassword('');
        fetchAdminProgress();
      } else {
        alert(data.message || data.error || 'Failed to update password.');
      }
    } catch (err) {
      alert('Error updating password: ' + err.message);
    }
  };

  const handleDeleteParticipant = async (participantId, teamName) => {
    if (!window.confirm(`[ALERT] Are you sure you want to delete participant team '${teamName}' and all associated scores?`)) return;

    try {
      const res = await fetch(`/api/admin/participant/${participantId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      const data = await parseJsonResponse(res);
      if (res.ok && data.success) {
        notifySaved(`[DELETE] DELETED PARTICIPANT '${teamName}'`);
        fetchAdminProgress();
      } else {
        alert(data.message || data.error || 'Failed to delete participant.');
      }
    } catch (err) {
      alert('Error deleting participant: ' + err.message);
    }
  };

  const handleCopyCredentials = (team) => {
    const credText = `Team Name: ${team.teamName}\nPassword: ${team.teamPassword || team.passcode || 'N/A'}`;
    navigator.clipboard.writeText(credText);
    notifySaved(`📋 COPIED CREDENTIALS FOR '${team.teamName}' TO CLIPBOARD`);
  };

  // ─── QUESTION BANK CRUD HANDLERS ───
  const filteredQuestions = questionBank.filter((q) => {
    if (selectedCategoryFilter === 'ALL') return true;
    return q.category === selectedCategoryFilter;
  });

  const selectedBankQ = questionBank.find((q) => q.id === selectedBankQId) || filteredQuestions[0] || questionBank[0];

  const handleBankFieldChange = async (field, val) => {
    if (!selectedBankQ) return;
    const patch = { [field]: val };
    try {
      const res = await fetch(`/api/admin/questions/${selectedBankQ.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(patch)
      });
      const data = await res.json();
      if (data.success) {
        setQuestionBank((prev) => prev.map((q) => q.id === selectedBankQ.id ? data.question : q));
        notifySaved(`UPDATED ${selectedBankQ.id}`);
      }
    } catch (err) {
      console.error('[Admin] Bank update failed:', err);
    }
  };

  const handleToggleQuestionEnabled = async (qId, currentStatus) => {
    const patch = { enabled: !currentStatus };
    try {
      const res = await fetch(`/api/admin/questions/${qId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(patch)
      });
      const data = await res.json();
      if (data.success) {
        setQuestionBank((prev) => prev.map((q) => q.id === qId ? data.question : q));
        notifySaved(`${qId} ${!currentStatus ? 'ENABLED' : 'DISABLED'}`);
      }
    } catch (err) {
      console.error('[Admin] Toggle failed:', err);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm(`[ALERT] Are you sure you want to permanently delete Question ${qId}?`)) return;
    try {
      const res = await fetch(`/api/admin/questions/${qId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      const data = await res.json();
      if (data.success) {
        setQuestionBank((prev) => prev.filter((q) => q.id !== qId));
        setSelectedBankQId(questionBank.find((q) => q.id !== qId)?.id || null);
        notifySaved(`DELETED ${qId}`);
      }
    } catch (err) {
      console.error('[Admin] Delete failed:', err);
    }
  };

  const handleCreateNewQuestion = async () => {
    if (!newQuestionData.title.trim() || !newQuestionData.question.trim()) {
      alert('Please provide both Title and Challenge Question prompt.');
      return;
    }

    try {
      const payload = {
        id: newQuestionData.id.trim() || undefined,
        title: newQuestionData.title,
        subtitle: newQuestionData.subtitle || 'System Protocol',
        category: newQuestionData.category,
        difficulty: newQuestionData.difficulty,
        investigationType: newQuestionData.investigationType,
        question: newQuestionData.question,
        keywords: newQuestionData.keywords.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        story: newQuestionData.story,
        codeLines: typeof newQuestionData.codeLines === 'string' ? newQuestionData.codeLines.split('\n') : newQuestionData.codeLines,
        hints: [
          { text: 'Analyze the system telemetry carefully.', penalty: 20 },
          { text: 'Consider fundamental computer science principles.', penalty: 40 }
        ],
        consequence: ['CHAMBER BREACHED', 'Access Granted!']
      };

      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setQuestionBank((prev) => [...prev, data.question]);
        setSelectedBankQId(data.question.id);
        setShowAddQuestionModal(false);
        notifySaved(`CREATED NEW QUESTION ${data.question.id}`);
      }
    } catch (err) {
      console.error('[Admin] Creation failed:', err);
    }
  };

  // ─── BULK JSON IMPORT / EXPORT HANDLERS ───
  const handleCopySchemaTemplate = () => {
    const jsonStr = JSON.stringify(QUESTION_JSON_SCHEMA_EXAMPLE, null, 2);
    navigator.clipboard.writeText(jsonStr);
    notifySaved('COPIED QUESTION JSON TEMPLATE TO CLIPBOARD');
  };

  const handleExportFullBankJson = () => {
    const jsonStr = JSON.stringify(questionBank, null, 2);
    navigator.clipboard.writeText(jsonStr);
    notifySaved(`COPIED FULL QUESTION BANK (${questionBank.length} Qs) AS JSON`);
  };

  const handleBulkImportJson = async () => {
    setImportError(null);
    try {
      let parsed = JSON.parse(importJsonText.trim());
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      if (parsed.length === 0) {
        setImportError('JSON must contain at least 1 question object.');
        return;
      }

      const res = await fetch('/api/admin/questions/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ questions: parsed })
      });
      const data = await res.json();
      if (data.success) {
        notifySaved(`SUCCESSFULLY IMPORTED ${data.count} QUESTIONS INTO BANK`);
        setShowImportModal(false);
        setImportJsonText('');
        fetchQuestionBank();
      } else {
        setImportError(data.message || 'Import failed.');
      }
    } catch (err) {
      setImportError(`Invalid JSON Syntax: ${err.message}`);
    }
  };

  const handleBankKeywordsChange = async (keywordsCsv) => {
    const kw = keywordsCsv.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    handleBankFieldChange('keywords', kw);
  };

  const formatTime = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return '00:00';
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  };

  const currentEventStatus = eventProgress.eventState?.status || 'CLOSED';
  const categories = ['ALL', 'Operating Systems', 'Databases', 'Algorithms', 'Data Structures', 'Logic & AI', 'Computer Systems', 'Discrete Math & Logic', 'Theory of Computation'];

  const leaderboardList = eventProgress.leaderboard || [];
  const filteredLeaderboard = leaderboardList.filter((r) =>
    r.teamName.toLowerCase().includes(leaderboardSearch.toLowerCase())
  );

  return (
    <div className="admin-overlay" role="dialog" aria-modal="true" aria-label="Doom Admin Command Center">
      <div className="admin-modal">
        {/* HEADER BAR */}
        <div className="admin-header">
          <div className="admin-header__brand">
            <div className="admin-header__icon"></div>
            <div>
              <div className="admin-header__title">DOCTOR DOOM // MASTER COMMAND CENTER</div>
              <div className="admin-header__subtitle">
                Two-Session Competition State Machine, Live Points Leaderboard & Question Bank Schema
              </div>
            </div>
          </div>
          <div className="admin-header__actions">
            {saveToast && (
              <div className="admin-save-toast">
                <span className="admin-save-toast__dot" />
                {saveToast}
              </div>
            )}
            <button className="admin-close-btn" onClick={onClose} title="Close Admin Panel (Esc)">
              ✕ CLOSE [ESC]
            </button>
          </div>
        </div>

        {/* MAIN NAV TABS */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-nav-tab ${activeTab === 'event_control' ? 'admin-nav-tab--active' : ''}`}
            onClick={() => setActiveTab('event_control')}
          >
             EVENT & TIMER CONTROL
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'credentials' ? 'admin-nav-tab--active' : ''}`}
            onClick={() => setActiveTab('credentials')}
          >
             PARTICIPANT CREDENTIALS ({eventProgress.totalParticipants || 0})
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'leaderboard' ? 'admin-nav-tab--active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
             LIVE LEADERBOARD & SCORING ({leaderboardList.length} TEAMS)
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'bank' ? 'admin-nav-tab--active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
             QUESTION BANK & JSON SCHEMA ({questionBank.length} Qs)
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'doom' ? 'admin-nav-tab--active' : ''}`}
            onClick={() => setActiveTab('doom')}
          >
             DOOM DIALOGUES & NARRATIVE
          </button>
        </div>

        {/* BODY CONTENT AREA */}
        <div className="admin-body">
          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 1: EVENT CONTROL & REAL-TIME TIMER ADJUSTMENTS          */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'event_control' && (
            <div className="admin-section">
              {/* STATUS BAR & ACTION BUTTONS */}
              <div className="admin-card">
                <div className="admin-card__title">
                  <span>EVENT STATE MACHINE CONTROLLER</span>
                  <span className="admin-badge" style={{ fontSize: '0.8rem', color: 'var(--doom-green-bright)' }}>
                    CURRENT: {currentEventStatus}
                  </span>
                </div>

                {/* MONGODB CLOUD PERSISTENCE STATUS */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: mongoStatus.connected ? 'rgba(0, 255, 102, 0.08)' : 'rgba(255, 180, 0, 0.08)',
                  border: `1px solid ${mongoStatus.connected ? 'var(--doom-green)' : 'rgba(255, 180, 0, 0.4)'}`,
                  borderRadius: '6px',
                  padding: '10px 16px',
                  marginBottom: '1.2rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: mongoStatus.connected ? '#00ff66' : '#ffb400',
                      boxShadow: mongoStatus.connected ? '0 0 10px #00ff66' : '0 0 10px #ffb400'
                    }} />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: mongoStatus.connected ? '#00ff66' : '#ffb400', letterSpacing: '0.05em' }}>
                        {mongoStatus.connected ? 'MONGODB CLOUD DATABASE: ONLINE & PERSISTING' : 'MONGODB DATABASE: OFFLINE (FALLBACK ZERO-LOSS JSON ENGINE ACTIVE)'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {mongoStatus.connected 
                          ? `Connected to: ${mongoStatus.uri || 'mongodb'} • All participant accounts, room progress, scores & timer states auto-replicated`
                          : 'Set MONGODB_URI in .env or Render/Atlas environment to auto-sync cloud MongoDB. All local data is 100% safe.'
                        }
                      </div>
                    </div>
                  </div>
                  <button
                    className="admin-btn admin-btn--secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    onClick={handleSyncMongo}
                    title="Force full sync between local engine and MongoDB"
                  >
                     SYNC TO MONGODB
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <button
                    className={`admin-btn ${currentEventStatus === 'CLOSED' ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                    onClick={() => handleUpdateEventState('CLOSED')}
                  >
                     [ 1. CLOSED / GATE LOCKED ]
                  </button>
                  <button
                    className={`admin-btn ${currentEventStatus === 'SESSION_1_ACTIVE' ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                    onClick={() => handleUpdateEventState('SESSION_1_ACTIVE')}
                  >
                    ▶ [ 2. OPEN SESSION 1 (CHAMBERS 01–15) ]
                  </button>
                  <button
                    className={`admin-btn ${currentEventStatus === 'SESSION_1_LOCKED' ? 'admin-btn--danger' : 'admin-btn--secondary'}`}
                    onClick={() => handleUpdateEventState('SESSION_1_LOCKED')}
                  >
                    ⏸ [ 3. LOCK SESSION 1 ]
                  </button>
                  <button
                    className={`admin-btn ${currentEventStatus === 'SESSION_2_ACTIVE' ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                    onClick={() => handleUpdateEventState('SESSION_2_ACTIVE')}
                  >
                     [ 4. OPEN SESSION 2 (CHAMBERS 16–30) ]
                  </button>
                  <button
                    className={`admin-btn ${currentEventStatus === 'SESSION_2_LOCKED' ? 'admin-btn--danger' : 'admin-btn--secondary'}`}
                    onClick={() => handleUpdateEventState('SESSION_2_LOCKED')}
                  >
                    ⏸ [ 5. LOCK SESSION 2 ]
                  </button>
                  <button
                    className={`admin-btn ${currentEventStatus === 'EVENT_FINISHED' ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                    onClick={() => handleUpdateEventState('EVENT_FINISHED')}
                  >
                    🏁 [ 6. END EVENT ]
                  </button>
                  <button
                    className="admin-btn admin-btn--danger"
                    style={{ marginLeft: 'auto' }}
                    onClick={handleResetCompetition}
                  >
                    🔄 RESET ALL TEAMS
                  </button>
                </div>

                {/* DYNAMIC TIMER CONTROL CARD */}
                <div style={{
                  background: 'rgba(0, 255, 102, 0.05)',
                  border: '1px solid rgba(0, 255, 102, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '1.2rem',
                  marginBottom: '1.2rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}></span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--doom-green-bright)', fontSize: '0.85rem' }}>
                          LIVE MISSION TIMER CONTROL (ON-THE-FLY SITUATION ADJUSTMENTS)
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-dim)' }}>
                          Add/remove minutes live during active session or set custom duration. Synchronized across all teams instantly.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="admin-badge" style={{ color: 'var(--doom-amber)' }}>
                        CONFIGURED DURATION: {durationInput} MIN
                      </span>
                      {eventProgress.eventState?.timer_paused ? (
                        <button
                          className="admin-btn admin-btn--sm admin-btn--primary"
                          onClick={() => handleAdjustTimer({ action: 'resume' })}
                        >
                          ▶ RESUME TIMER
                        </button>
                      ) : (
                        <button
                          className="admin-btn admin-btn--sm admin-btn--danger"
                          onClick={() => handleAdjustTimer({ action: 'pause' })}
                        >
                          ⏸ PAUSE TIMER
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink)' }}>
                      EXTEND / REDUCE TIME:
                    </span>
                    <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => handleAdjustTimer({ minutes: 1 })}>
                      +1 MIN
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => handleAdjustTimer({ minutes: 5 })}>
                      +5 MIN
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => handleAdjustTimer({ minutes: 10 })}>
                      +10 MIN
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => handleAdjustTimer({ minutes: -1 })}>
                      –1 MIN
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => handleAdjustTimer({ minutes: -5 })}>
                      –5 MIN
                    </button>

                    <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink)' }}>
                      SET DURATION PRESET:
                    </span>
                    {[15, 20, 30, 45, 60].map((m) => (
                      <button
                        key={m}
                        className={`admin-btn admin-btn--xs ${durationInput === m ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                        onClick={() => {
                          setDurationInput(m);
                          handleAdjustTimer({ durationMinutes: m });
                        }}
                      >
                        {m}m
                      </button>
                    ))}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        className="admin-input"
                        style={{ width: '70px', padding: '4px 8px', fontSize: '0.85rem' }}
                        value={durationInput}
                        onChange={(e) => setDurationInput(parseInt(e.target.value, 10) || 1)}
                      />
                      <button
                        className="admin-btn admin-btn--sm admin-btn--primary"
                        onClick={() => handleAdjustTimer({ durationMinutes: Number(durationInput) })}
                      >
                        APPLY
                      </button>
                    </div>
                  </div>
                </div>

                {/* EVENT SUMMARY METRICS */}
                <div className="admin-grid-3">
                  <div className="admin-hint-card">
                    <div className="admin-hint-card__header">
                      <span>TOTAL REGISTERED TEAMS</span>
                      <span className="admin-badge">{eventProgress.totalParticipants}</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'var(--doom-green-bright)', fontWeight: 'bold' }}>
                      {eventProgress.totalParticipants} PARTICIPANTS
                    </div>
                  </div>

                  <div className="admin-hint-card">
                    <div className="admin-hint-card__header">
                      <span>SESSION 1 ACTIVE / COMPLETE</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'var(--doom-cyan)', fontWeight: 'bold' }}>
                      {eventProgress.participants.filter(p => p.session1Completed).length} / {eventProgress.totalParticipants} DONE
                    </div>
                  </div>

                  <div className="admin-hint-card">
                    <div className="admin-hint-card__header">
                      <span>SESSION 2 ACTIVE / COMPLETE</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'var(--doom-purple)', fontWeight: 'bold' }}>
                      {eventProgress.participants.filter(p => p.session2Completed).length} / {eventProgress.totalParticipants} DONE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: PARTICIPANT CREDENTIALS MANAGEMENT                       */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'credentials' && (
            <div className="admin-section">
              {/* CREATE PARTICIPANT CREDENTIALS CARD */}
              <div className="admin-card" style={{ marginBottom: '20px' }}>
                <div className="admin-card__title">
                  <span>CREATE PARTICIPANT LOGIN CREDENTIALS</span>
                  <span className="admin-badge" style={{ color: 'var(--doom-green-bright)' }}>
                    STORED IN BACKEND DATABASE & MONGODB
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#9bb5a7', marginBottom: '16px', lineHeight: '1.4' }}>
                  Create login credentials for participants. The credentials created here are stored securely in the backend database. Share these credentials with the participants so they can log in.
                </p>

                <form onSubmit={handleCreateParticipantCredentials} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 240px' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--doom-green)', marginBottom: '6px' }}>
                      TEAM NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ALPHA-TEAM"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="admin-input"
                      style={{ width: '100%', padding: '10px 14px' }}
                    />
                  </div>

                  <div style={{ flex: '1 1 240px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--doom-green)' }}>
                        PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomPassword}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#00e5ff',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        🎲 Auto-Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. PASS-9281"
                      value={newTeamPassword}
                      onChange={(e) => setNewTeamPassword(e.target.value)}
                      className="admin-input"
                      style={{ width: '100%', padding: '10px 14px' }}
                    />
                  </div>

                  <div style={{ flex: '0 0 auto' }}>
                    <button
                      type="submit"
                      className="admin-btn admin-btn--primary"
                      style={{ padding: '11px 24px', fontWeight: 700, fontSize: '0.85rem' }}
                    >
                       CREATE & STORE CREDENTIALS
                    </button>
                  </div>
                </form>
              </div>

              {/* STORED CREDENTIALS LIST CARD */}
              <div className="admin-card">
                <div className="admin-card__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span>STORED PARTICIPANT CREDENTIALS ({eventProgress.participants?.length || 0})</span>
                  </div>
                  <input
                    type="text"
                    placeholder=" Search team credentials..."
                    value={credentialsSearch}
                    onChange={(e) => setCredentialsSearch(e.target.value)}
                    className="admin-input"
                    style={{ width: '240px', padding: '6px 12px', fontSize: '0.8rem' }}
                  />
                </div>

                <div style={{ overflowX: 'auto', marginTop: '14px' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--doom-border-dim)', color: 'var(--doom-green-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        <th style={{ padding: '10px' }}>TEAM NAME</th>
                        <th style={{ padding: '10px' }}>PASSWORD (STORED IN BACKEND)</th>
                        <th style={{ padding: '10px' }}>CREATED AT</th>
                        <th style={{ padding: '10px' }}>LAST ACTIVE</th>
                        <th style={{ padding: '10px' }}>PROGRESS</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!eventProgress.participants || eventProgress.participants.length === 0) ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#688575', fontFamily: 'var(--font-mono)' }}>
                            No participant credentials created yet. Use the form above to create login credentials.
                          </td>
                        </tr>
                      ) : (
                        eventProgress.participants
                          .filter(p => p.teamName.toLowerCase().includes(credentialsSearch.toLowerCase()))
                          .map((p) => {
                            const isEditing = editingParticipantId === p.id;
                            const createdDate = p.registeredAt ? new Date(p.registeredAt).toLocaleString() : 'N/A';
                            const lastActiveDate = p.lastActiveAt ? new Date(p.lastActiveAt).toLocaleTimeString() : 'Never';

                            return (
                              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                <td style={{ padding: '12px 10px', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                                   {p.teamName}
                                </td>
                                <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                      <input
                                        type="text"
                                        value={editTeamPassword}
                                        onChange={(e) => setEditTeamPassword(e.target.value)}
                                        className="admin-input"
                                        style={{ padding: '4px 8px', fontSize: '0.8rem', width: '130px' }}
                                      />
                                      <button
                                        onClick={() => handleUpdateParticipantPassword(p.id)}
                                        className="admin-btn admin-btn--primary"
                                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingParticipantId(null)}
                                        className="admin-btn"
                                        style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#333' }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <span style={{
                                      background: 'rgba(0, 229, 255, 0.1)',
                                      border: '1px solid rgba(0, 229, 255, 0.3)',
                                      color: '#00e5ff',
                                      padding: '4px 10px',
                                      borderRadius: '4px',
                                      fontWeight: '600',
                                      letterSpacing: '0.05em'
                                    }}>
                                      {p.teamPassword || p.passcode || '(no pass)'}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px 10px', color: '#8aa697', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                                  {createdDate}
                                </td>
                                <td style={{ padding: '12px 10px', color: p.lastActiveAt ? '#00ff66' : '#688575', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                                  {lastActiveDate}
                                </td>
                                <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#fff' }}>
                                  {p.progress || '0 / 15'}
                                </td>
                                <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => handleCopyCredentials(p)}
                                      className="admin-btn"
                                      style={{ padding: '5px 10px', fontSize: '0.75rem', background: 'rgba(0, 255, 102, 0.15)', border: '1px solid rgba(0, 255, 102, 0.4)', color: '#00ff66' }}
                                      title="Copy Team Name & Password to clipboard"
                                    >
                                      📋 Copy
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingParticipantId(p.id);
                                        setEditTeamPassword(p.teamPassword || p.passcode || '');
                                      }}
                                      className="admin-btn"
                                      style={{ padding: '5px 10px', fontSize: '0.75rem', background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.4)', color: '#00e5ff' }}
                                      title="Edit Team Password"
                                    >
                                       Edit Pass
                                    </button>
                                    <button
                                      onClick={() => handleDeleteParticipant(p.id, p.teamName)}
                                      className="admin-btn"
                                      style={{ padding: '5px 10px', fontSize: '0.75rem', background: 'rgba(255, 50, 50, 0.15)', border: '1px solid rgba(255, 50, 50, 0.4)', color: '#ff4444' }}
                                      title="Delete Participant"
                                    >
                                      [DELETE] Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 2: LIVE LEADERBOARD & SCORING (POINTS - HINTS & TIE-BREAK)*/}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'leaderboard' && (
            <div className="admin-section">
              {/* SCORING EXPLANATION BANNER */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(0,255,102,0.12), rgba(0,229,255,0.06), transparent)',
                border: '1px solid rgba(0,255,102,0.3)',
                borderRadius: '8px',
                padding: '12px 18px',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--doom-green-bright)', fontSize: '0.85rem' }}>
                     MASTER COMPETITION SCORING MATRIX & TIE-BREAKER ENGINE
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-dim)', marginTop: '2px' }}>
                    • Solved Room: <strong>+100 Base Points</strong> &nbsp;|&nbsp; • Hints Used: <strong>Deducts Points (−20 pts / hint)</strong> &nbsp;|&nbsp; • Floor: 10 pts/room &nbsp;|&nbsp; • <strong>Tie-Breaker: Lowest Total Completion Time</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder=" Filter team callsign..."
                    className="admin-input"
                    style={{ width: '220px', padding: '6px 12px', fontSize: '0.8rem' }}
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                  />
                  <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={fetchAdminProgress}>
                    🔄 REFRESH
                  </button>
                </div>
              </div>

              {/* LEADERBOARD TABLE */}
              <div className="admin-card">
                <div className="admin-card__title">
                  <span>OFFICIAL MASTER LEADERBOARD ({filteredLeaderboard.length} RANKED TEAMS)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-faint)' }}>
                    POLLING ACTIVE (3s)
                  </span>
                </div>

                {filteredLeaderboard.length === 0 ? (
                  <div className="admin-empty-state">
                    NO PARTICIPANT RESULTS REGISTERED YET. ONCE TEAMS COMPLETE ROOMS, SCORES & TIE-BREAKER RANKINGS WILL APPEAR HERE.
                  </div>
                ) : (
                  <div className="leaderboard-table-wrap">
                    <table className="leaderboard-table">
                      <thead>
                        <tr>
                          <th>RANK</th>
                          <th>TEAM CALLSIGN</th>
                          <th>ROOMS SOLVED</th>
                          <th>HINTS USED & DEDUCTION</th>
                          <th>TOTAL POINTS</th>
                          <th>SESSION 1 (PTS / TIME)</th>
                          <th>SESSION 2 (PTS / TIME)</th>
                          <th>TOTAL TIME (TIE-BREAKER)</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeaderboard.map((row) => {
                          const isTop1 = row.rank === 1;
                          const isTop2 = row.rank === 2;
                          const isTop3 = row.rank === 3;

                          return (
                            <tr
                              key={row.participantId}
                              className={`leaderboard-row ${isTop1 ? 'leaderboard-row--gold' : isTop2 ? 'leaderboard-row--silver' : isTop3 ? 'leaderboard-row--bronze' : ''}`}
                            >
                              <td className="leaderboard-cell--rank" style={{ fontWeight: 'bold' }}>
                                {isTop1 ? '01 01' : isTop2 ? '02 02' : isTop3 ? '03 03' : `#${String(row.rank).padStart(2, '0')}`}
                              </td>
                              <td className="leaderboard-cell--team" style={{ color: 'var(--doom-green-bright)' }}>
                                {row.teamName}
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                                {row.solvedCount || row.totalScore} / 30
                              </td>
                              <td>
                                {row.hintsUsedCount > 0 ? (
                                  <span style={{ color: 'var(--doom-red)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {row.hintsUsedCount} Hints (−{row.totalPenalty} pts)
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--doom-green-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                                    0 Hints (No Penalty)
                                  </span>
                                )}
                              </td>
                              <td className="leaderboard-cell--total-score" style={{ color: 'var(--doom-green-bright)', fontSize: '1.05rem', fontWeight: 'bold' }}>
                                {row.totalPoints || 0} PTS
                              </td>
                              <td>
                                <span className="leaderboard-tag">
                                  {row.session1Points || 0} pts ({formatTime(row.session1Time)})
                                </span>
                              </td>
                              <td>
                                <span className="leaderboard-tag">
                                  {row.session2Points || 0} pts ({formatTime(row.session2Time)})
                                </span>
                              </td>
                              <td className="leaderboard-cell--total-time" style={{ color: 'var(--doom-cyan)', fontWeight: 'bold' }}>
                                 {formatTime(row.totalTime)}
                              </td>
                              <td>
                                <span className={`leaderboard-status-tag ${row.isComplete ? 'leaderboard-status-tag--done' : 'leaderboard-status-tag--progress'}`}>
                                  {row.isComplete ? '● COMPLETED' : '● IN MISSION'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 3: QUESTION BANK MANAGER & JSON SCHEMA FORMAT           */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'bank' && (
            <div className="admin-section">
              {/* TOP BAR: JSON SCHEMA TEMPLATES, IMPORT & EXPORT */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(0,255,102,0.1), rgba(0,229,255,0.05), transparent)',
                border: '1px solid rgba(0,255,102,0.3)',
                borderRadius: '8px',
                padding: '14px 18px',
                marginBottom: '1.2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--doom-green-bright)', fontSize: '0.88rem' }}>
                    📋 STANDARDIZED QUESTION JSON SCHEMA & INPUT SPECIFICATION
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-dim)', marginTop: '2px' }}>
                    Copy template JSON to design questions in the exact expected schema, or import/export questions in bulk.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={handleCopySchemaTemplate}>
                    📋 COPY SCHEMA TEMPLATE (JSON)
                  </button>
                  <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={() => setShowImportModal(true)}>
                    📥 IMPORT QUESTIONS (JSON)
                  </button>
                  <button className="admin-btn admin-btn--sm admin-btn--secondary" onClick={handleExportFullBankJson}>
                    📤 EXPORT ALL ({questionBank.length} Qs)
                  </button>
                  <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => setShowAddQuestionModal(true)}>
                    ➕ ADD NEW QUESTION
                  </button>
                </div>
              </div>

              {/* CATEGORY FILTER STRIP */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span className="admin-field-label" style={{ marginBottom: 0 }}>FILTER CATEGORY:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`admin-btn admin-btn--xs ${selectedCategoryFilter === cat ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
                    onClick={() => setSelectedCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* QUESTION SELECTOR STRIP */}
              <div className="admin-level-picker">
                <span className="admin-field-label" style={{ marginBottom: 0 }}>SELECT QUESTION FROM BANK:</span>
                <div className="admin-level-buttons">
                  {filteredQuestions.map((q) => (
                    <button
                      key={q.id}
                      className={`admin-level-btn ${selectedBankQId === q.id ? 'admin-level-btn--active' : ''} ${q.enabled === false ? 'admin-level-btn--disabled' : ''}`}
                      onClick={() => setSelectedBankQId(q.id)}
                      style={{ opacity: q.enabled === false ? 0.5 : 1 }}
                    >
                      {q.id} {q.enabled === false ? '🚫' : ''} ({q.category})
                    </button>
                  ))}
                </div>
              </div>

              {/* QUESTION EDITING CARD */}
              {selectedBankQ && (
                <div className="admin-card">
                  <div className="admin-card__title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>EDITING QUESTION {selectedBankQ.id}: {selectedBankQ.title}</span>
                      <span className="admin-badge">{selectedBankQ.category}</span>
                      <span className="admin-badge" style={{ color: 'var(--doom-amber)' }}>{selectedBankQ.difficulty}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className={`admin-btn admin-btn--xs ${selectedBankQ.enabled !== false ? 'admin-btn--secondary' : 'admin-btn--primary'}`}
                        onClick={() => handleToggleQuestionEnabled(selectedBankQ.id, selectedBankQ.enabled !== false)}
                      >
                        {selectedBankQ.enabled !== false ? '🟢 ENABLED (IN POOL)' : '🔴 DISABLED (EXCLUDED)'}
                      </button>
                      <button
                        className="admin-btn admin-btn--xs admin-btn--danger"
                        onClick={() => handleDeleteQuestion(selectedBankQ.id)}
                      >
                        [DELETE] DELETE QUESTION
                      </button>
                    </div>
                  </div>

                  <div className="admin-grid-3">
                    <div className="admin-field">
                      <label className="admin-field-label">TITLE</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={selectedBankQ.title || ''}
                        onChange={(e) => handleBankFieldChange('title', e.target.value)}
                      />
                    </div>

                    <div className="admin-field">
                      <label className="admin-field-label">SUBTITLE / CONCEPT</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={selectedBankQ.subtitle || ''}
                        onChange={(e) => handleBankFieldChange('subtitle', e.target.value)}
                      />
                    </div>

                    <div className="admin-field">
                      <label className="admin-field-label">CATEGORY</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={selectedBankQ.category || ''}
                        onChange={(e) => handleBankFieldChange('category', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-grid-3" style={{ marginTop: '0.8rem' }}>
                    <div className="admin-field">
                      <label className="admin-field-label">DIFFICULTY</label>
                      <select
                        className="admin-select"
                        value={selectedBankQ.difficulty || 'Medium'}
                        onChange={(e) => handleBankFieldChange('difficulty', e.target.value)}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div className="admin-field">
                      <label className="admin-field-label">INVESTIGATION WIDGET TYPE</label>
                      <select
                        className="admin-select"
                        value={selectedBankQ.investigationType || 'code'}
                        onChange={(e) => handleBankFieldChange('investigationType', e.target.value)}
                      >
                        <option value="code">Code Widget</option>
                        <option value="terminal">Terminal Widget</option>
                        <option value="signal">Signal / DB Widget</option>
                        <option value="network">Network Map Widget</option>
                        <option value="final">Final Recap Widget</option>
                      </select>
                    </div>

                    <div className="admin-field">
                      <label className="admin-field-label">EVIDENCE DOSSIER TITLE</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={selectedBankQ.evidenceTitle || ''}
                        onChange={(e) => handleBankFieldChange('evidenceTitle', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* QUESTION PROMPT & KEYWORDS */}
                  <div className="admin-field" style={{ marginTop: '1rem' }}>
                    <label className="admin-field-label">CHALLENGE PROMPT QUESTION</label>
                    <textarea
                      rows={2}
                      className="admin-textarea"
                      value={selectedBankQ.question || ''}
                      onChange={(e) => handleBankFieldChange('question', e.target.value)}
                    />
                  </div>

                  <div className="admin-field" style={{ marginTop: '1rem' }}>
                    <label className="admin-field-label" style={{ color: 'var(--doom-green-bright)' }}>
                      SECRET SERVER-SIDE ANSWER KEYWORDS (COMMA-SEPARATED)
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ color: 'var(--doom-green-bright)', fontWeight: 'bold' }}
                      value={(selectedBankQ.keywords || []).join(', ')}
                      onChange={(e) => handleBankKeywordsChange(e.target.value)}
                    />
                    <span className="admin-field-hint">
                      Answers submitted by participants will be validated on the backend against these secret keywords.
                    </span>
                  </div>

                  {/* NARRATIVE STORY */}
                  <div className="admin-field" style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="admin-field-label" style={{ marginBottom: 0 }}>STORY PARAGRAPHS</label>
                      <button
                        className="admin-btn admin-btn--xs admin-btn--primary"
                        onClick={() => handleBankFieldChange('story', [...(selectedBankQ.story || []), 'New story intel paragraph.'])}
                      >
                        + ADD PARAGRAPH
                      </button>
                    </div>
                    <div className="admin-paragraphs-list">
                      {(selectedBankQ.story || []).map((p, pIdx) => (
                        <div key={pIdx} className="admin-paragraph-item">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span className="admin-paragraph-index">PARAGRAPH {pIdx + 1}</span>
                            <button
                              className="admin-btn admin-btn--xs admin-btn--danger"
                              onClick={() => {
                                const updated = (selectedBankQ.story || []).filter((_, idx) => idx !== pIdx);
                                handleBankFieldChange('story', updated);
                              }}
                            >
                              ✕ REMOVE
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            className="admin-textarea"
                            value={p}
                            onChange={(e) => {
                              const newStory = [...(selectedBankQ.story || [])];
                              newStory[pIdx] = e.target.value;
                              handleBankFieldChange('story', newStory);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CODE SNIPPET (IF ANY) */}
                  <div className="admin-field" style={{ marginTop: '1rem' }}>
                    <label className="admin-field-label">CODE SNIPPET LINES (1 PER LINE)</label>
                    <textarea
                      rows={4}
                      className="admin-textarea admin-textarea--code"
                      value={(selectedBankQ.codeLines || []).join('\n')}
                      onChange={(e) => handleBankFieldChange('codeLines', e.target.value.split('\n'))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 4: DOOM DIALOGUES & NARRATIVE                           */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'doom' && (
            <div className="admin-section">
              <div className="admin-card">
                <div className="admin-card__title">
                  <span>DOCTOR DOOM // CINEMATIC DIALOGUES & QUOTES</span>
                  <span className="admin-badge">NARRATIVE ENGINE</span>
                </div>

                <div className="admin-field">
                  <label className="admin-field-label">DOCTOR DOOM HUD REACTION QUOTES (1 PER LINE)</label>
                  <textarea
                    rows={6}
                    className="admin-textarea"
                    value={(content.systemConfig?.doomQuotes || []).join('\n')}
                    onChange={(e) => {
                      const quotes = e.target.value.split('\n').filter(Boolean);
                      contentStore.updateSystemConfig({ doomQuotes: quotes });
                      setContent(contentStore.getContent());
                      notifySaved('DOOM QUOTES UPDATED');
                    }}
                  />
                  <span className="admin-field-hint">
                    These sinister quotes are spoken by Doctor Doom on the header across chambers.
                  </span>
                </div>

                <div className="admin-field" style={{ marginTop: '1.5rem' }}>
                  <label className="admin-field-label">LIVE LATVERIA-NET TICKER MESSAGES (1 PER LINE)</label>
                  <textarea
                    rows={4}
                    className="admin-textarea"
                    value={(content.systemConfig?.tickerMessages || []).join('\n')}
                    onChange={(e) => {
                      const msgs = e.target.value.split('\n').filter(Boolean);
                      contentStore.updateSystemConfig({ tickerMessages: msgs });
                      setContent(contentStore.getContent());
                      notifySaved('TICKER MESSAGES UPDATED');
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL: BULK IMPORT QUESTIONS FROM JSON                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      {showImportModal && (
        <div className="modal-overlay is-open" style={{ zIndex: 450 }}>
          <div className="modal-content" style={{ maxWidth: '780px', background: '#051009', border: '1px solid var(--doom-green)', borderRadius: '10px' }}>
            <div className="modal-head" style={{ borderBottom: '1px solid rgba(0,255,102,0.2)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ color: 'var(--doom-green-bright)', margin: 0, fontSize: '1.1rem' }}>
                  📥 BULK IMPORT / ADD QUESTIONS VIA JSON
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-dim)' }}>
                  Paste a single question JSON object or an array of question objects matching the standardized schema.
                </span>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={() => setShowImportModal(false)}>✕</button>
            </div>

            <div style={{ margin: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="admin-field-label" style={{ marginBottom: 0 }}>PASTE QUESTION(S) JSON:</label>
                <button
                  className="admin-btn admin-btn--xs admin-btn--secondary"
                  onClick={() => setImportJsonText(JSON.stringify([QUESTION_JSON_SCHEMA_EXAMPLE], null, 2))}
                >
                  PASTE SAMPLE TEMPLATE
                </button>
              </div>

              <textarea
                rows={14}
                className="admin-textarea admin-textarea--code"
                placeholder='[\n  {\n    "id": "Q21",\n    "title": "ROOM 21: TITLE",\n    "question": "Prompt...",\n    "keywords": ["KEYWORD"]\n  }\n]'
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  setImportError(null);
                }}
              />

              {importError && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(255, 51, 102, 0.15)', border: '1px solid var(--doom-red)', borderRadius: '4px', color: 'var(--doom-red)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  [ALERT] {importError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
              <button className="btn btn--ghost" onClick={() => setShowImportModal(false)}>CANCEL</button>
              <button className="btn btn--primary" onClick={handleBulkImportJson}>VALIDATE & IMPORT TO BANK</button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD SINGLE NEW QUESTION FORM                         */}
      {/* ──────────────────────────────────────────────────────────── */}
      {showAddQuestionModal && (
        <div className="modal-overlay is-open" style={{ zIndex: 400 }}>
          <div className="modal-content" style={{ maxWidth: '720px', background: '#07150c', border: '1px solid var(--doom-green)', borderRadius: '10px' }}>
            <div className="modal-head" style={{ borderBottom: '1px solid rgba(0,255,102,0.2)', paddingBottom: '12px' }}>
              <h3 style={{ color: 'var(--doom-green-bright)', margin: 0, fontSize: '1.1rem' }}>➕ CREATE NEW QUESTION IN BANK</h3>
              <button className="btn btn--ghost btn--sm" onClick={() => setShowAddQuestionModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <div className="admin-grid-2">
                <div>
                  <label className="admin-field-label">QUESTION ID (OPTIONAL)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Q21"
                    value={newQuestionData.id}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="admin-field-label">TITLE</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. ROOM 21: THE QUANTUM CIPHER"
                    value={newQuestionData.title}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-grid-2">
                <div>
                  <label className="admin-field-label">CATEGORY</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={newQuestionData.category}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="admin-field-label">DIFFICULTY</label>
                  <select
                    className="admin-select"
                    value={newQuestionData.difficulty}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="admin-field-label">CHALLENGE PROMPT QUESTION</label>
                <textarea
                  rows={2}
                  className="admin-textarea"
                  placeholder="What is the cryptographic concept...?"
                  value={newQuestionData.question}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, question: e.target.value })}
                />
              </div>

              <div>
                <label className="admin-field-label" style={{ color: 'var(--doom-green-bright)' }}>
                  SECRET SERVER ANSWER KEYWORDS (COMMA-SEPARATED)
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="RSA, ASYMMETRIC, PUBLIC KEY"
                  value={newQuestionData.keywords}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, keywords: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
              <button className="btn btn--ghost" onClick={() => setShowAddQuestionModal(false)}>CANCEL</button>
              <button className="btn btn--primary" onClick={handleCreateNewQuestion}>SAVE TO BANK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
