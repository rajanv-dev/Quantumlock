import React, { useState, useEffect, useRef } from 'react';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { Scanlines } from './components/Scanlines';
import { LandingScreen } from './components/LandingScreen';
import { WaitingRoom } from './components/WaitingRoom';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { TransitionOverlay } from './components/TransitionOverlay';
import { TopNav } from './components/TopNav';
import { StageTracker } from './components/StageTracker';
import { DoomQuestionHeader } from './components/DoomQuestionHeader';
import { DoomDialogueOverlay } from './components/DoomDialogueOverlay';
import InvestigationJournal from './components/InvestigationJournal';
import { HintModal } from './components/HintModal';
import { FailureModal } from './components/FailureModal';
import { CongratulationsModal } from './components/CongratulationsModal';
import { ResultsScreen } from './components/ResultsScreen';
import { AdminPanel } from './components/admin/AdminPanel';
import { CommandAuthModal } from './components/CommandAuthModal';
import { VideoIntro } from './components/VideoIntro';

import { TerminalWidget } from './components/widgets/TerminalWidget';
import { SignalWidget } from './components/widgets/SignalWidget';
import { NetworkMapWidget } from './components/widgets/NetworkMapWidget';
import { CodeWidget } from './components/widgets/CodeWidget';
import { FinalRecapWidget } from './components/widgets/FinalRecapWidget';
import { PuzzleCard } from './components/widgets/PuzzleCard';

import { narrativeEngine } from './engine/narrativeEngine';
import { SoundManager } from './utils/soundManager';
import { timerSynchronizer } from './utils/timerSync';
import { IconCheck, IconTerminal } from './components/CyberIcons';

const TOKEN_KEY = 'AIDEX_PARTICIPANT_TOKEN_V1';
const TEAM_NAME_KEY = 'AIDEX_TEAM_NAME_V1';

export default function App() {
  const [participantToken, setParticipantToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [teamName, setTeamName] = useState(() => localStorage.getItem(TEAM_NAME_KEY) || '');
  const [showVideoIntro, setShowVideoIntro] = useState(false);
  const [eventState, setEventState] = useState({ status: 'CLOSED', active_session: 0 });
  const [sessionStats, setSessionStats] = useState({});
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // UI Modals & Command Auth
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthToken, setAdminAuthToken] = useState(null);
  const [commandModalOpen, setCommandModalOpen] = useState(false);
  const [commandModalMode, setCommandModalMode] = useState('command'); // 'command' | 'admin_auth'
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [congratsModalOpen, setCongratsModalOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [levelSelectOpen, setLevelSelectOpen] = useState(false);
  const [activeCinematic, setActiveCinematic] = useState(null);
  const [soundOn, setSoundOn] = useState(false);

  // Gameplay State
  const [solvedQuestions, setSolvedQuestions] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [hintsUsed, setHintsUsed] = useState({});
  const [remainingTime, setRemainingTime] = useState(30 * 60);
  const [failureModalDismissed, setFailureModalDismissed] = useState(false);
  const [narrativeState, setNarrativeState] = useState(narrativeEngine.getStateSnapshot());
  const [isChamberEntering, setIsChamberEntering] = useState(false);
  const hasInitializedQuestionIndexRef = useRef(false);
  const lastSessionNumberRef = useRef(null);

  const [revealedParas, setRevealedParas] = useState(1);
  const currentQuestion = currentQuestions[activeQuestionIndex] || currentQuestions[0] || null;
  const currentSessionNumber = eventState.active_session || 1;

  // Helper to ensure window & container scroll to top immediately
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      const stageViewport = document.getElementById('stage-viewport');
      if (stageViewport) stageViewport.scrollTop = 0;
      const screenGame = document.getElementById('screen-game');
      if (screenGame) screenGame.scrollTop = 0;
    } catch (e) {
      window.scrollTo(0, 0);
    }
  };

  // Subscribe to narrative engine
  useEffect(() => {
    const unsub = narrativeEngine.subscribe((snapshot) => {
      setNarrativeState(snapshot);
    });
    return unsub;
  }, []);

  // Ensure every room/stage starts at the top
  useEffect(() => {
    scrollToTop();
  }, [activeQuestionIndex, currentSessionNumber, eventState.status]);

  // Reset or initialize paragraph-by-paragraph reveal for the current question
  useEffect(() => {
    if (currentQuestion) {
      const isSolved = currentQuestion.isSolved || solvedQuestions.includes(currentQuestion.id);
      if (isSolved) {
        setRevealedParas((currentQuestion.story || []).length || 1);
      } else {
        setRevealedParas(1);
      }
    }
  }, [activeQuestionIndex, currentSessionNumber, currentQuestion?.id, solvedQuestions.length]);

  // Global Keyboard Listener: '/' opens command palette, 'Ctrl+Shift+A' opens Admin Auth Prompt
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore if user is currently typing in an input, textarea or contenteditable element
      const targetTag = e.target?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || e.target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setCommandModalMode('admin_auth');
        setCommandModalOpen(true);
        return;
      }

      if (!isInput && e.key === '/') {
        e.preventDefault();
        setCommandModalMode('command');
        setCommandModalOpen(true);
      }
    };

    // Check URL Path / Hash on load (/option, #/option, /admin, #/admin, /leaderboard, #/leaderboard)
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path.includes('/option') || path === '/option' || hash.includes('option') || search.includes('option') ||
        path.includes('/admin') || path === '/admin' || hash.includes('admin') || search.includes('admin')
      ) {
        setCommandModalMode('admin_auth');
        setCommandModalOpen(true);
      } else if (path.includes('/leaderboard') || path === '/leaderboard' || hash.includes('leaderboard') || search.includes('leaderboard')) {
        setLeaderboardOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    checkRoute();

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVER STATE SYNCHRONIZATION (INITIAL LOAD, REFRESH & SSE STREAM)
  // ─────────────────────────────────────────────────────────────────────────────
  const syncServerState = async () => {
    try {
      if (participantToken) {
        const res = await fetch('/api/participant/state', {
          headers: { 'x-participant-token': participantToken }
        });
        if (res.status === 401) {
          console.warn('[App] Participant token rejected (401). Clearing stale session.');
          handleLogout();
          return;
        }
        const data = await res.json();
        if (data && data.success) {
          setEventState(data.eventState);
          setTeamName(data.participant.teamName);
          setSessionStats(data.sessionStats || {});
          timerSynchronizer.syncServerState(data.eventState);
          setRemainingTime(timerSynchronizer.getRemainingSeconds());

          if (data.hintsUsed && Array.isArray(data.hintsUsed)) {
            const mapped = {};
            data.hintsUsed.forEach((h) => {
              const key = `q_${String(h.questionId).toLowerCase()}`;
              if (!mapped[key]) mapped[key] = [];
              if (!mapped[key].includes(h.hintIdx)) mapped[key].push(h.hintIdx);
            });
            setHintsUsed((prev) => ({ ...prev, ...mapped }));
          }

          if (data.questions && data.questions.length > 0) {
            setCurrentQuestions(data.questions);
            const solved = data.questions.filter((q) => q.isSolved).map((q) => q.id);
            setSolvedQuestions((prev) => Array.from(new Set([...prev, ...solved])));

            // Rebuild evidence list from all solved questions
            const solvedEvidence = data.questions
              .filter((q) => q.isSolved && q.evidenceTitle)
              .map((q) => ({
                id: q.id,
                title: q.evidenceTitle,
                note: q.consequence && q.consequence[1] ? q.consequence[1] : 'Protocol override verified.'
              }));
            if (solvedEvidence.length > 0) {
              setEvidenceList((prev) => {
                const existingIds = new Set(prev.map((e) => e.id));
                const newItems = solvedEvidence.filter((e) => !existingIds.has(e.id));
                return [...prev, ...newItems];
              });
            }

            // Set active question on initial load / session change
            const currentSess = data.sessionNumber || data.eventState?.active_session || 1;
            if (!hasInitializedQuestionIndexRef.current || lastSessionNumberRef.current !== currentSess) {
              const firstUnsolved = data.questions.findIndex((q) => !q.isSolved);
              const targetIdx = firstUnsolved !== -1 ? firstUnsolved : (data.questions.length - 1);
              setActiveQuestionIndex(targetIdx);
              hasInitializedQuestionIndexRef.current = true;
              lastSessionNumberRef.current = currentSess;
            }
          }
        } else {
          console.warn('[App] Participant token state invalid. Clearing stale session:', data?.message);
          handleLogout();
        }
      } else {
        const res = await fetch('/api/event/status');
        const data = await res.json();
        if (data && data.eventState) {
          setEventState(data.eventState);
          timerSynchronizer.syncServerState(data.eventState);
          setRemainingTime(timerSynchronizer.getRemainingSeconds());
        }
      }
    } catch (err) {
      console.warn('[App] Server synchronization notice:', err);
    }
  };

  // Connect to Real-Time SSE Stream for instant Admin Events (No Polling Loops!)
  useEffect(() => {
    // Initial authoritative fetch on load / refresh / token change
    syncServerState();

    let eventSource = null;
    try {
      eventSource = new EventSource('/api/events/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type) {
            if (
              data.type === 'SESSION_OPENED' ||
              data.type === 'SESSION_LOCKED' ||
              data.type === 'TIMER_ADJUSTED' ||
              data.type === 'EVENT_STATE_CHANGED' ||
              data.type === 'INIT_STATE'
            ) {
              const newEventState = data.payload?.eventState || data.payload;
              if (newEventState) {
                setEventState(newEventState);
                timerSynchronizer.syncServerState(newEventState);
                setRemainingTime(timerSynchronizer.getRemainingSeconds());
              }
              if (participantToken) {
                syncServerState();
              }
            } else if (data.type === 'EVENT_RESET') {
              setEventState(data.payload);
              timerSynchronizer.syncServerState(data.payload);
              setRemainingTime(timerSynchronizer.getRemainingSeconds());
              if (participantToken) {
                syncServerState();
              }
            } else if (data.type === 'LEADERBOARD_UPDATED') {
              // Update stats on leaderboard event
              if (participantToken) {
                fetch('/api/participant/state', { headers: { 'x-participant-token': participantToken } })
                  .then((r) => r.json())
                  .then((d) => { if (d && d.success) setSessionStats(d.sessionStats || {}); })
                  .catch(() => { });
              }
            }
          }
        } catch (e) { }
      };
    } catch (e) { }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [participantToken]);

  // ─────────────────────────────────────────────────────────────────────────────
  // PURE LOCAL 1-SECOND TIMER COUNTDOWN (DERIVED FROM SERVER sessionEndTime)
  // ZERO DATABASE POLLING REQUIRED!
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    timerSynchronizer.syncServerState(eventState);

    const updateCountdown = () => {
      const remaining = timerSynchronizer.getRemainingSeconds();
      setRemainingTime(remaining);
      if (remaining > 0) {
        setFailureModalDismissed(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventState.status, eventState.session_end_time, eventState.timer_paused, eventState.active_session]);

  // ─────────────────────────────────────────────────────────────────────────────
  // PARTICIPANT REGISTRATION & LOGIN (WITH PASSCODE & RESTORE STATE)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleRegisterTeam = async (callsign, passcode = '') => {
    try {
      const res = await fetch('/api/participant/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: callsign, passcode })
      });
      const data = await res.json();
      if (data && data.success) {
        localStorage.setItem(TOKEN_KEY, data.participant.token);
        localStorage.setItem(TEAM_NAME_KEY, data.participant.teamName);
        setParticipantToken(data.participant.token);
        setTeamName(data.participant.teamName);
        setEventState(data.eventState);
        setShowVideoIntro(true);
        SoundManager.play('success', soundOn);
        await syncServerState();
        return { success: true };
      } else {
        return { success: false, message: data.message || 'REGISTRATION FAILED' };
      }
    } catch (err) {
      return { success: false, message: 'Network connection failed.' };
    }
  };

  const handleLoginTeam = async (callsign, passcode = '') => {
    try {
      const res = await fetch('/api/participant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: callsign, passcode })
      });
      const data = await res.json();
      if (data && data.success) {
        localStorage.setItem(TOKEN_KEY, data.participant.token);
        localStorage.setItem(TEAM_NAME_KEY, data.participant.teamName);
        setParticipantToken(data.participant.token);
        setTeamName(data.participant.teamName);
        setEventState(data.eventState);
        setShowVideoIntro(true);
        SoundManager.play('success', soundOn);
        await syncServerState();
        return { success: true };
      } else {
        return { success: false, message: data.message || 'LOGIN FAILED' };
      }
    } catch (err) {
      return { success: false, message: 'Network connection failed.' };
    }
  };

  // Transition overlay state
  const [transitioning, setTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState(null);

  const triggerRoomTransition = (targetIndex, options = {}) => {
    const targetQ = currentQuestions[targetIndex];
    const fromTitle = currentQuestion ? (currentQuestion.title || currentQuestion.name) : 'CHAMBER COMPLETED';
    const nextDisplayNumber = targetIndex + 1 + (currentSessionNumber === 2 ? 15 : 0);

    setTransitionData({
      fromRoom: fromTitle,
      toRoom: targetQ ? (targetQ.title || targetQ.name) : `ROOM ${String(nextDisplayNumber).padStart(2, '0')}`,
      toSubtitle: targetQ ? (targetQ.subtitle || 'Classified Protocol') : 'Classified Protocol',
      toCategory: targetQ ? (targetQ.category || 'Investigation') : 'Investigation',
      toLevelNumber: nextDisplayNumber,
      storyTeaser: targetQ && targetQ.story && targetQ.story[0]
        ? targetQ.story[0].replace(/<[^>]+>/g, '')
        : 'Decrypting incoming logic vectors and telemetry...',
      targetIndex: targetIndex,
      isSessionComplete: options.isSessionComplete || false
    });
    setTransitioning(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TEAM_NAME_KEY);
    hasInitializedQuestionIndexRef.current = false;
    lastSessionNumberRef.current = null;
    setShowVideoIntro(false);
    setParticipantToken(null);
    setTeamName('');
    setCurrentQuestions([]);
    setSolvedQuestions([]);
    setCongratsModalOpen(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ANSWER SUBMISSION VIA REST API
  // ─────────────────────────────────────────────────────────────────────────────
  const isTimeExpired = remainingTime <= 0 && (eventState.status === 'SESSION_1_ACTIVE' || eventState.status === 'SESSION_2_ACTIVE');

  const handleValidateAnswer = async (stageKey, answer) => {
    if (isTimeExpired) {
      return { success: false, message: 'COUNTDOWN EXPIRED — Session timer reached zero. Inputs are locked.' };
    }

    if (!currentQuestion || !participantToken) {
      return { success: false, message: 'AUTHENTICATION REQUIRED' };
    }

    try {
      const res = await fetch(`/api/session/${currentSessionNumber}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-participant-token': participantToken
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer
        })
      });

      const data = await res.json();
      if (data && data.success) {
        SoundManager.play('success', soundOn);

        // Update currentQuestions with solved and attempts status
        setCurrentQuestions((prev) =>
          prev.map((q) =>
            q.id === currentQuestion.id
              ? {
                ...q,
                isSolved: true,
                attemptsRemaining: 0,
                attemptsUsed: data.attemptsUsed || 1,
                isLocked: false,
                potentialPoints: data.pointsEarned !== undefined ? data.pointsEarned : q.potentialPoints
              }
              : q
          )
        );

        const updatedSolved = Array.from(new Set([...solvedQuestions, currentQuestion.id]));
        setSolvedQuestions(updatedSolved);

        if (data.evidenceTitle) {
          setEvidenceList((prev) => [
            ...prev,
            { id: currentQuestion.id, title: data.evidenceTitle, note: data.successNote }
          ]);
        }

        narrativeEngine.onCorrectAnswer(`level_${activeQuestionIndex + 1 + (currentSessionNumber === 2 ? 15 : 0)}`);

        // Use updatedSolved (freshly computed) — only complete when all 15 questions are solved
        const currentSessionSolvedCount = currentQuestions.filter((q) => updatedSolved.includes(q.id)).length;
        if (currentQuestions.length >= 15 && currentSessionSolvedCount >= currentQuestions.length) {
          triggerRoomTransition(activeQuestionIndex, { isSessionComplete: true });
          setCongratsModalOpen(true);
          // Complete session on backend
          await fetch(`/api/session/${currentSessionNumber}/complete`, {
            method: 'POST',
            headers: { 'x-participant-token': participantToken }
          });
          syncServerState();
        } else {
          // Trigger blockbuster cinematic room transition after brief 450ms breach celebration
          setTimeout(() => {
            const nextUnsolved = currentQuestions.findIndex((q, i) => i > activeQuestionIndex && !updatedSolved.includes(q.id));
            const targetIdx = nextUnsolved !== -1 ? nextUnsolved : (activeQuestionIndex < currentQuestions.length - 1 ? activeQuestionIndex + 1 : activeQuestionIndex);
            if (targetIdx !== activeQuestionIndex) {
              triggerRoomTransition(targetIdx);
            }
          }, 450);
        }

        return { success: true, message: data.message };
      } else {
        SoundManager.play('error', soundOn);
        narrativeEngine.onWrongAnswer(`level_${activeQuestionIndex + 1 + (currentSessionNumber === 2 ? 15 : 0)}`);

        // Update attemptsRemaining and isLocked in currentQuestions
        if (data && (data.attemptsRemaining !== undefined || data.isLocked !== undefined)) {
          setCurrentQuestions((prev) =>
            prev.map((q) =>
              q.id === currentQuestion.id
                ? {
                  ...q,
                  attemptsRemaining: data.attemptsRemaining,
                  attemptsUsed: data.attemptsUsed,
                  isLocked: Boolean(data.isLocked),
                  potentialPoints: data.isLocked ? 0 : Math.max(0, (q.potentialPoints || 20) - 2)
                }
                : q
            )
          );
        }

        // Trigger server state sync to immediately reflect any updates
        syncServerState();
        return {
          success: false,
          attemptsRemaining: data?.attemptsRemaining,
          attemptsUsed: data?.attemptsUsed,
          isLocked: data?.isLocked,
          message: data?.message || 'ACCESS DENIED — −2 Points Penalty.'
        };
      }
    } catch (err) {
      return { success: false, message: 'NETWORK ERROR — failed to validate answer.' };
    }
  };

  const handleRevealHint = (stageKey, hintIdx, penalty = 20) => {
    if (isTimeExpired) return;

    setHintsUsed((prev) => {
      const current = prev[stageKey] || [];
      if (current.includes(hintIdx)) return prev;
      return { ...prev, [stageKey]: [...current, hintIdx] };
    });

    const numPenalty = Number(penalty) || 20;
    narrativeEngine.onHintUsed(`level_${activeQuestionIndex + 1 + (currentSessionNumber === 2 ? 15 : 0)}`);

    // Authoritative server-side hint recording & point deduction
    if (participantToken && currentQuestion) {
      fetch(`/api/session/${currentSessionNumber}/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-participant-token': participantToken
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          hintIdx,
          penalty: numPenalty
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.eventState) {
            timerSynchronizer.syncServerState(data.eventState);
            setRemainingTime(timerSynchronizer.getRemainingSeconds());
          }
        })
        .catch((err) => console.warn('[Hint] Server sync error:', err));
    }
  };

  const formatClock = (totalSeconds) => {
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  };

  const isWarning = remainingTime <= 300 && remainingTime > 0;
  const timerString = formatClock(remainingTime);
  const sessionSolvedCount = currentQuestions.filter((q) => solvedQuestions.includes(q.id)).length;
  const progressPct = currentQuestions.length > 0 ? Math.round((sessionSolvedCount / currentQuestions.length) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER GATES
  // ─────────────────────────────────────────────────────────────────────────────

  // Gate 1: Landing screen if team not registered yet
  if (!participantToken) {
    return (
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Scanlines isCritical={false} />
        <LandingScreen
          isActive={true}
          hasSavedGame={false}
          onEnterProtocol={handleRegisterTeam}
          onLoginTeam={handleLoginTeam}
          onContinueMission={handleLoginTeam}
          onNewMission={handleRegisterTeam}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn(!soundOn)}
        />
        <CommandAuthModal
          isOpen={commandModalOpen}
          mode={commandModalMode}
          onClose={() => setCommandModalOpen(false)}
          onOpenAdmin={(requireAuth, token) => {
            if (requireAuth) {
              setCommandModalMode('admin_auth');
              setCommandModalOpen(true);
            } else {
              setAdminAuthToken(token);
              setAdminOpen(true);
            }
          }}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          onLogout={handleLogout}
        />
        <AdminPanel isOpen={adminOpen} onClose={() => setAdminOpen(false)} adminToken={adminAuthToken || 'robin123'} />
        <LeaderboardModal isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
      </div>
    );
  }

  // Gate 1.5: Full-screen Single-Play Video Intro state right after successful login
  if (showVideoIntro) {
    return (
      <VideoIntro onEnded={() => setShowVideoIntro(false)} />
    );
  }

  // Gate 2: Waiting Room only for admin-controlled closed/locked states.
  // Do NOT send to WaitingRoom just because session is expired or all solved —
  // FailureModal and the in-game locked overlay handle those cases.
  const isWaitingRoomState = (
    eventState.status === 'CLOSED' ||
    eventState.status === 'SESSION_1_LOCKED' ||
    eventState.status === 'SESSION_2_LOCKED' ||
    eventState.status === 'EVENT_FINISHED'
  );

  const displayLevelNumber = activeQuestionIndex + 1 + (currentSessionNumber === 2 ? 15 : 0);

  return (
    <div>
      <BackgroundCanvas />
      <Scanlines isCritical={isWarning} />

      {/* TOP HUD NAVIGATION */}
      <TopNav
        timerString={timerString}
        isWarning={isWarning}
        sessionLabel={
          eventState.status === 'SESSION_2_ACTIVE'
            ? 'SESSION 2'
            : (eventState.status === 'SESSION_1_ACTIVE' ? 'SESSION 1' : 'MISSION')
        }
        isPaused={Boolean(eventState.timer_paused)}
        isExpired={isTimeExpired}
        progressPct={progressPct}
        evidenceCount={evidenceList.length}
        onOpenEvidence={() => setJournalOpen(true)}
        onOpenHint={() => setHintModalOpen(true)}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn(!soundOn)}
        onOpenLeaderboard={() => setLeaderboardOpen(true)}
        onLogout={handleLogout}
        teamName={teamName}
      />

      {/* WAITING ROOM / ACCESS GATE */}
      {isWaitingRoomState ? (
        <WaitingRoom
          eventState={eventState}
          teamName={teamName}
          sessionStats={sessionStats}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          onLogout={handleLogout}
        />
      ) : (
        /* ACTIVE COMPETITION STAGE VIEWPORT */
        <section id="screen-game" className="screen screen-game is-active">
          {/* STAGE TRACKER (QUESTIONS 1 TO 15 OF ACTIVE SESSION) */}
          <StageTracker
            currentPartId={currentSessionNumber}
            levels={currentQuestions.map((q, idx) => ({
              id: idx + 1 + (currentSessionNumber === 2 ? 15 : 0),
              key: q.id,
              name: q.title || q.name,
              subtitle: q.subtitle
            }))}
            currentLevelIndex={activeQuestionIndex}
            solvedPuzzles={solvedQuestions}
            onSelectLevel={(idx) => {
              if (idx !== activeQuestionIndex) {
                triggerRoomTransition(idx);
              }
            }}
            onOpenLevelSelect={() => setLevelSelectOpen(true)}
          />

          {currentQuestion && (
            <DoomQuestionHeader
              currentLevel={{ id: displayLevelNumber, name: currentQuestion.name }}
              currentPartId={currentSessionNumber}
            />
          )}

          <main className={`stage-viewport ${isChamberEntering ? 'chamber-entering' : ''}`} id="stage-viewport" style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {currentQuestion && (
              <>
                {/* ─── 1. FULL STORY & MISSION INTEL ─── */}
                <div className="doom-intel-console">
                  <div className="doom-intel-console__topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#F0B429', letterSpacing: '0.03em', fontWeight: '600' }}>
                        Latveria-Net Dossier
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#718078', letterSpacing: 'normal' }}>
                      Session {currentSessionNumber} · Level {displayLevelNumber} of 30 ({currentQuestion.category || 'Logic'})
                    </span>
                  </div>

                  <div className="doom-intel-console__content">
                    <p className="story-eyebrow" style={{ textTransform: 'none', letterSpacing: 'normal', color: '#00FF9C', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                      Mission Intel — {currentQuestion.subtitle || 'If/Else Decisions'}
                    </p>
                    <h2 className="story-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '700', color: '#E8F5EE', letterSpacing: 'normal', margin: '4px 0 16px 0' }}>
                      {currentQuestion.name}
                    </h2>
                    <div className="story-text">
                      {(currentQuestion.story || []).slice(0, revealedParas).map((p, i) => (
                        <div
                          key={i}
                          className="story-para-entry"
                          style={{
                            marginBottom: '1rem',
                            padding: '14px 18px',
                            background: i === 0 ? 'rgba(0, 255, 156, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                            borderLeft: i === revealedParas - 1 && revealedParas < (currentQuestion.story || []).length
                              ? '3px solid var(--doom-cyan)'
                              : '3px solid rgba(0, 255, 156, 0.4)',
                            borderRadius: '0 6px 6px 0',
                            animation: 'paraFadeIn 0.3s ease-out forwards',
                            position: 'relative'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            paddingBottom: '4px'
                          }}>
                            <span style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.78rem',
                              color: '#9BAFA5',
                              letterSpacing: 'normal',
                              fontWeight: 600
                            }}>
                              Intel Entry {String(i + 1).padStart(2, '0')} of {String((currentQuestion.story || []).length).padStart(2, '0')}
                            </span>
                            {i === revealedParas - 1 && revealedParas < (currentQuestion.story || []).length && (
                              <span style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.7rem',
                                color: 'var(--doom-cyan)',
                                background: 'rgba(0, 229, 255, 0.12)',
                                border: '1px solid rgba(0, 229, 255, 0.3)',
                                padding: '1px 6px',
                                borderRadius: '3px'
                              }}>
                                Latest Entry
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.65', color: '#E8F5EE' }} dangerouslySetInnerHTML={{ __html: p }} />
                        </div>
                      ))}
                    </div>

                    {/* ─── PARAGRAPH-BY-PARAGRAPH REVEAL CONTROLS ─── */}
                    {(currentQuestion.story || []).length > 1 && (
                      <div style={{
                        marginTop: '1.2rem',
                        padding: '12px 18px',
                        background: 'rgba(5, 15, 10, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '120px',
                            height: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${Math.round((revealedParas / (currentQuestion.story || []).length) * 100)}%`,
                              height: '100%',
                              background: '#00FF9C',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#9BAFA5' }}>
                            Decrypted {revealedParas} of {(currentQuestion.story || []).length} entries
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#00FF9C', fontWeight: 'bold' }}>
                            {Math.round((revealedParas / (currentQuestion.story || []).length) * 100)}%
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {revealedParas < (currentQuestion.story || []).length ? (
                            <>
                              <button
                                type="button"
                                className="btn btn--primary btn--sm"
                                onClick={() => {
                                  SoundManager.play('click', soundOn);
                                  setRevealedParas((prev) => Math.min((currentQuestion.story || []).length, prev + 1));
                                }}
                                style={{
                                  background: 'rgba(0, 255, 156, 0.15)',
                                  border: '1px solid #00FF9C',
                                  color: '#00FF9C',
                                  fontWeight: '600',
                                  fontSize: '0.82rem',
                                  padding: '6px 14px',
                                  letterSpacing: '0.03em',
                                  textTransform: 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  borderRadius: '4px'
                                }}
                              >
                                <span>Reveal Next</span>
                                <span style={{ fontSize: '9px' }}>▾</span>
                              </button>

                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => {
                                  SoundManager.play('click', soundOn);
                                  setRevealedParas((currentQuestion.story || []).length);
                                }}
                                style={{
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  color: '#9BAFA5',
                                  fontSize: '0.8rem',
                                  padding: '6px 12px',
                                  textTransform: 'none',
                                  cursor: 'pointer',
                                  borderRadius: '4px'
                                }}
                              >
                                Reveal All
                              </button>
                            </>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.82rem',
                                color: '#00FF9C',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <IconCheck size={14} color="#00FF9C" /> Full dossier decrypted
                              </span>
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => setRevealedParas(1)}
                                style={{
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  color: '#718078',
                                  fontSize: '0.75rem',
                                  padding: '3px 8px',
                                  textTransform: 'none',
                                  cursor: 'pointer',
                                  borderRadius: '4px'
                                }}
                                title="Collapse back to first entry"
                              >
                                Collapse
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── 2. INVESTIGATION WIDGET (CODE / LOGIC / TERMINAL / SIGNAL / NETWORK) ─── */}
                {currentQuestion.codeLines && currentQuestion.codeLines.length > 0 ? (
                  <CodeWidget stage={currentQuestion} />
                ) : currentQuestion.investigationType === 'terminal' ? (
                  <TerminalWidget evidenceList={evidenceList} onAddEvidence={() => { }} />
                ) : currentQuestion.investigationType === 'signal' ? (
                  <SignalWidget evidenceList={evidenceList} onAddEvidence={() => { }} />
                ) : currentQuestion.investigationType === 'network' ? (
                  <NetworkMapWidget evidenceList={evidenceList} onAddEvidence={() => { }} />
                ) : currentQuestion.investigationType === 'final' ? (
                  <FinalRecapWidget evidenceList={evidenceList} fragments={{}} />
                ) : (
                  <CodeWidget stage={currentQuestion} />
                )}

                {/* ─── 3. INTERACTIVE PUZZLE TRANSMISSION CARD ─── */}
                <PuzzleCard
                  key={`puzzle_${currentQuestion.id || activeQuestionIndex}_${displayLevelNumber}`}
                  stage={{
                    ...currentQuestion,
                    id: displayLevelNumber,
                    key: currentQuestion.id,
                    name: currentQuestion.title || currentQuestion.name,
                    question: currentQuestion.question,
                    hints: currentQuestion.hints,
                    isSolved: currentQuestion.isSolved || solvedQuestions.includes(currentQuestion.id),
                    attemptsRemaining: currentQuestion.attemptsRemaining,
                    attemptsUsed: currentQuestion.attemptsUsed,
                    isLocked: currentQuestion.isLocked,
                    potentialPoints: currentQuestion.potentialPoints
                  }}
                  hintsUsed={hintsUsed}
                  isTimeExpired={isTimeExpired}
                  onSubmitAnswer={handleValidateAnswer}
                  onRequestHint={() => setHintModalOpen(true)}
                />
              </>
            )}
          </main>
        </section>
      )}

      {/* DOOM REACTIVE OVERLAY */}
      <DoomDialogueOverlay
        dialogue={narrativeState.currentDialogue}
        onChoice={(choice) => narrativeEngine.onDialogueChoice(choice)}
        onDismiss={() => narrativeEngine.dismissDialogue()}
        currentLevel={{ id: displayLevelNumber, name: currentQuestion?.name }}
      />

      {/* HINT MODAL */}
      {currentQuestion && (
        <HintModal
          isOpen={hintModalOpen}
          stage={{
            id: displayLevelNumber,
            key: currentQuestion.id,
            name: currentQuestion.name || currentQuestion.title,
            hints: currentQuestion.hints
          }}
          hintsUsed={hintsUsed}
          onRevealHint={handleRevealHint}
          onClose={() => setHintModalOpen(false)}
        />
      )}

      {/* LEVEL SELECT SCREEN MODAL */}
      <LevelSelectScreen
        isOpen={levelSelectOpen}
        parts={[
          {
            id: currentSessionNumber,
            title: `SESSION ${currentSessionNumber}: ${currentSessionNumber === 1 ? 'AVENGERS TOWER CORE (LEVELS 01–15)' : 'INNER SANCTUM PROTOCOLS (LEVELS 16–30)'}`,
            description: `Your assigned 15 chambers for Session ${currentSessionNumber}`,
            levels: currentQuestions.map((q, idx) => ({
              id: idx + 1 + (currentSessionNumber === 2 ? 15 : 0),
              key: q.id,
              name: q.name,
              subtitle: q.subtitle
            }))
          }
        ]}
        currentLevelIndex={activeQuestionIndex}
        unlockedLevelIndex={currentQuestions.length - 1}
        solvedPuzzles={solvedQuestions}
        onSelectLevel={(idx) => {
          setLevelSelectOpen(false);
          if (idx !== activeQuestionIndex) {
            triggerRoomTransition(idx);
          }
        }}
        onClose={() => setLevelSelectOpen(false)}
      />

      {/* EVIDENCE JOURNAL */}
      <InvestigationJournal
        isOpen={journalOpen}
        onClose={() => setJournalOpen(false)}
        currentStage={currentQuestion ? {
          ...currentQuestion,
          id: displayLevelNumber,
          title: currentQuestion.name || currentQuestion.title,
          codeLines: currentQuestion.codeLines,
          story: currentQuestion.story,
          question: currentQuestion.question,
          hints: currentQuestion.hints
        } : null}
        evidenceList={evidenceList}
        narrativeState={narrativeState}
        onFlagContradiction={() => { }}
      />

      {/* CINEMATIC ROOM TRANSITION OVERLAY */}
      <TransitionOverlay
        isActive={transitioning}
        transitionData={transitionData || {}}
        soundOn={soundOn}
        onFinish={() => {
          if (transitionData && typeof transitionData.targetIndex === 'number') {
            setActiveQuestionIndex(transitionData.targetIndex);
          }
          scrollToTop();
          setTransitioning(false);
          setIsChamberEntering(true);
          setTimeout(() => {
            scrollToTop();
            setIsChamberEntering(false);
          }, 500);
        }}
      />

      {/* COMMAND PALETTE & ADMIN AUTH MODAL */}
      <CommandAuthModal
        isOpen={commandModalOpen}
        mode={commandModalMode}
        onClose={() => setCommandModalOpen(false)}
        onOpenAdmin={(requireAuth, token) => {
          if (requireAuth) {
            setCommandModalMode('admin_auth');
            setCommandModalOpen(true);
          } else {
            setAdminAuthToken(token);
            setAdminOpen(true);
          }
        }}
        onOpenLeaderboard={() => setLeaderboardOpen(true)}
        onLogout={handleLogout}
      />

      {/* LEADERBOARD MODAL */}
      <LeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />

      {/* CONGRATULATIONS & SESSION FINISHED POPUP */}
      <CongratulationsModal
        isOpen={congratsModalOpen}
        sessionNumber={currentSessionNumber}
        teamName={teamName}
        stats={sessionStats}
        onClose={() => setCongratsModalOpen(false)}
        onLogout={handleLogout}
        onViewLeaderboard={() => {
          setCongratsModalOpen(false);
          setLeaderboardOpen(true);
        }}
      />

      {/* FAILURE / SESSION TIMEOUT MODAL */}
      <FailureModal
        isOpen={
          isTimeExpired &&
          Boolean(participantToken) &&
          (eventState.status === 'SESSION_1_ACTIVE' || eventState.status === 'SESSION_2_ACTIVE') &&
          solvedQuestions.length < currentQuestions.length &&
          !failureModalDismissed
        }
        onRestart={() => setLeaderboardOpen(true)}
        onViewLeaderboard={() => setLeaderboardOpen(true)}
        onDismiss={() => setFailureModalDismissed(true)}
      />

      {/* DOCTOR DOOM ADMIN COMMAND CENTER */}
      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        adminToken={adminAuthToken || 'robin123'}
      />
    </div>
  );
}

