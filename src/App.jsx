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
import { timerSynchronizer } from './utils/timerSync';
import { IconCheck, IconTerminal } from './components/CyberIcons';

const TOKEN_KEY = 'AIDEX_PARTICIPANT_TOKEN_V1';
const TEAM_NAME_KEY = 'AIDEX_TEAM_NAME_V1';

export default function App() {
  const [participantToken, setParticipantToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [teamName, setTeamName] = useState(() => localStorage.getItem(TEAM_NAME_KEY) || '');
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));
  const [requestedRedirect, setRequestedRedirect] = useState(null);
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
  // Guard: prevent syncServerState from overwriting optimistic participant_started during session start
  const isStartingSessionRef = useRef(false);

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

  // ─────────────────────────────────────────────────────────────────────────────
  // CENTRALIZED ROUTE PROTECTION & AUTH GUARD (RULES 1, 2, 3, 5, 9, 10, 14)
  // ─────────────────────────────────────────────────────────────────────────────
  const checkAuthAndRoute = (questionsList = currentQuestions) => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const redirectQuery = searchParams.get('redirect');

    // Match dynamic room/level routes e.g. /room/5, /level/10
    const roomMatch = path.match(/\/(?:room|level)\/(\d+)/i) || hash.match(/(?:room|level)\/(\d+)/i);
    const targetRoomId = roomMatch ? parseInt(roomMatch[1], 10) : null;

    const isProtectedRoute = targetRoomId !== null || (
      path.includes('/dashboard') ||
      path.includes('/game') ||
      path.includes('/mission') ||
      path.includes('/room') ||
      path.includes('/level') ||
      path.includes('/profile')
    );

    const token = localStorage.getItem(TOKEN_KEY);

    // Modal routes
    if (
      path.includes('/option') || path === '/option' || hash.includes('option') || search.includes('option') ||
      path.includes('/admin') || path === '/admin' || hash.includes('admin') || search.includes('admin')
    ) {
      setCommandModalMode('admin_auth');
      setCommandModalOpen(true);
    } else if (path.includes('/leaderboard') || path === '/leaderboard' || hash.includes('leaderboard') || search.includes('leaderboard')) {
      setLeaderboardOpen(true);
    }

    if (!token) {
      // UNAUTHENTICATED ACCESS ATTEMPT TO PROTECTED ROUTE (Rules 1, 2, 5)
      if (isProtectedRoute) {
        const fullPath = window.location.pathname + window.location.search + window.location.hash;
        setRequestedRedirect(fullPath);
        const safeRedirectUrl = `/login?redirect=${encodeURIComponent(fullPath)}`;
        window.history.replaceState({}, '', safeRedirectUrl);
      }
    } else {
      // AUTHENTICATED USER ACCESS (Rules 3, 5, 14)
      const targetRedirect = redirectQuery || requestedRedirect;
      const targetMatch = targetRedirect ? targetRedirect.match(/\/(?:room|level)\/(\d+)/i) : null;
      const finalRoomId = targetMatch ? parseInt(targetMatch[1], 10) : targetRoomId;

      if (finalRoomId !== null && questionsList && questionsList.length > 0) {
        const sessNum = eventState.active_session || 1;
        const roomOffset = sessNum === 2 ? 15 : 0;
        const targetIdx = finalRoomId - 1 - roomOffset;
        if (targetIdx >= 0 && targetIdx < questionsList.length) {
          setActiveQuestionIndex(targetIdx);
        }
      }
    }
  };

  // Global Keyboard Listener & URL Hash/State Route Guard
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
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

    const handleRouteEvent = () => {
      checkAuthAndRoute();
    };

    const handleStorageChange = (e) => {
      if (e.key === TOKEN_KEY) {
        const newToken = localStorage.getItem(TOKEN_KEY);
        if (!newToken && participantToken) {
          handleLogout();
        } else if (newToken && newToken !== participantToken) {
          setParticipantToken(newToken);
          syncServerState();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('hashchange', handleRouteEvent);
    window.addEventListener('popstate', handleRouteEvent);
    window.addEventListener('storage', handleStorageChange);

    checkAuthAndRoute();

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('hashchange', handleRouteEvent);
      window.removeEventListener('popstate', handleRouteEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [participantToken]);

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVER STATE SYNCHRONIZATION (INITIAL LOAD, REFRESH & SSE STREAM)
  // ─────────────────────────────────────────────────────────────────────────────
  const syncServerState = async ({ skipIfStarting = false } = {}) => {
    // During session start, prevent a stale server response from overwriting participant_started=true
    if (skipIfStarting && isStartingSessionRef.current) return;
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
          // If session is being started, preserve the optimistic participant_started flag
          const safeEventState = isStartingSessionRef.current
            ? { ...data.eventState, participant_started: true, timer_on_hold: false }
            : data.eventState;
          setEventState(safeEventState);
          setTeamName(data.participant.teamName);
          setSessionStats(data.sessionStats || {});
          timerSynchronizer.syncServerState(safeEventState);
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

            // Set active question on initial load / session change / URL route
            const currentSess = data.sessionNumber || data.eventState?.active_session || 1;
            const path = window.location.pathname.toLowerCase();
            const hash = window.location.hash.toLowerCase();
            const roomMatch = path.match(/\/(?:room|level)\/(\d+)/i) || hash.match(/(?:room|level)\/(\d+)/i);
            const targetRoomId = roomMatch ? parseInt(roomMatch[1], 10) : null;

            if (targetRoomId !== null) {
              const roomOffset = currentSess === 2 ? 15 : 0;
              const targetIdx = targetRoomId - 1 - roomOffset;
              if (targetIdx >= 0 && targetIdx < data.questions.length) {
                setActiveQuestionIndex(targetIdx);
              }
              hasInitializedQuestionIndexRef.current = true;
              lastSessionNumberRef.current = currentSess;
            } else if (!hasInitializedQuestionIndexRef.current || lastSessionNumberRef.current !== currentSess) {
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
    } finally {
      setAuthLoading(false);
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
              if (newEventState && !isStartingSessionRef.current) {
                setEventState(newEventState);
                timerSynchronizer.syncServerState(newEventState);
                setRemainingTime(timerSynchronizer.getRemainingSeconds());
              }
              if (participantToken) {
                syncServerState({ skipIfStarting: true });
              }
            } else if (data.type === 'EVENT_RESET') {
              isStartingSessionRef.current = false;
              setEventState(data.payload);
              timerSynchronizer.syncServerState(data.payload);
              setRemainingTime(timerSynchronizer.getRemainingSeconds());
              if (participantToken) {
                syncServerState();
              }
            } else if (data.type === 'LEADERBOARD_UPDATED') {
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
  // PARTICIPANT REGISTRATION & LOGIN (WITH RETURN URL REDIRECT)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAuthCompletion = async (token, teamCallsign, eventStateData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TEAM_NAME_KEY, teamCallsign);
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(TEAM_NAME_KEY, teamCallsign);
    setParticipantToken(token);
    setTeamName(teamCallsign);
    setEventState(eventStateData);
    setShowVideoIntro(true);

    await syncServerState();

    // Rule 3: Return to requested URL after login
    const searchParams = new URLSearchParams(window.location.search);
    const redirectParam = searchParams.get('redirect') || requestedRedirect;
    if (redirectParam && redirectParam.startsWith('/')) {
      window.history.replaceState({}, '', redirectParam);
      const roomMatch = redirectParam.match(/\/(?:room|level)\/(\d+)/i);
      if (roomMatch) {
        const rId = parseInt(roomMatch[1], 10);
        const sessNum = eventStateData.active_session || 1;
        const roomOffset = sessNum === 2 ? 15 : 0;
        const targetIdx = rId - 1 - roomOffset;
        if (targetIdx >= 0) {
          setActiveQuestionIndex(targetIdx);
        }
      }
      setRequestedRedirect(null);
    } else {
      window.history.replaceState({}, '', '/game');
    }
  };

  const handleRegisterTeam = async (callsign, passcode = '') => {
    try {
      const res = await fetch('/api/participant/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: callsign, passcode })
      });
      const data = await res.json();
      if (data && data.success) {
        await handleAuthCompletion(data.participant.token, data.participant.teamName, data.eventState);
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
        await handleAuthCompletion(data.participant.token, data.participant.teamName, data.eventState);
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

    // Sync browser URL with room
    window.history.pushState({}, '', `/room/${nextDisplayNumber}`);

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
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TEAM_NAME_KEY);
    hasInitializedQuestionIndexRef.current = false;
    lastSessionNumberRef.current = null;
    setShowVideoIntro(false);
    setParticipantToken(null);
    setTeamName('');
    setCurrentQuestions([]);
    setSolvedQuestions([]);
    setCongratsModalOpen(false);
    setAuthLoading(false);
    setRequestedRedirect(null);

    // Replace browser history so Back button does NOT return to protected route
    window.history.replaceState({}, '', '/login');
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
        narrativeEngine.onWrongAnswer(`level_${activeQuestionIndex + 1 + (currentSessionNumber === 2 ? 15 : 0)}`);

        // Update wrongCount, attemptsUsed and potentialPoints in currentQuestions
        const updatedWrongs = data?.wrongCount !== undefined
          ? data.wrongCount
          : (data?.attemptsUsed !== undefined ? data.attemptsUsed : ((currentQuestion.attemptsUsed || 0) + 1));

        setCurrentQuestions((prev) =>
          prev.map((q) => {
            if (q.id === currentQuestion.id) {
              const usedHintsCount = (hintsUsed[q.id] || []).length;
              const hDeduct = usedHintsCount >= 3 ? 20 : (usedHintsCount === 2 ? 8 : (usedHintsCount === 1 ? 3 : 0));
              const penWrongs = Math.max(0, updatedWrongs - 2);
              const calculatedPotential = usedHintsCount >= 3 ? 0 : Math.max(0, 20 - hDeduct - (penWrongs * 2));

              return {
                ...q,
                attemptsRemaining: null,
                attemptsUsed: updatedWrongs,
                wrongCount: updatedWrongs,
                isLocked: false,
                potentialPoints: calculatedPotential
              };
            }
            return q;
          })
        );

        // Trigger server state sync to immediately reflect any updates
        syncServerState();
        return {
          success: false,
          attemptsRemaining: null,
          attemptsUsed: updatedWrongs,
          wrongCount: updatedWrongs,
          isLocked: false,
          message: data?.message || 'ACCESS DENIED — Incorrect key.'
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

  const handleStartParticipantSession = async () => {
    if (!participantToken) return;
    const sessNum = eventState.active_session || (eventState.status?.startsWith('SESSION_2') ? 2 : 1);
    
    // Mark that we are starting — guard syncServerState from overwriting optimistic state
    isStartingSessionRef.current = true;

    // Immediate optimistic transition — operative enters the chamber instantly without server lag
    const optimisticStartTime = Date.now();
    const optimisticEndTime = optimisticStartTime + ((eventState.session_duration_minutes || 60) * 60 * 1000);
    const optimisticState = {
      ...eventState,
      participant_started: true,
      timer_on_hold: false,
      session_start_time: optimisticStartTime,
      session_end_time: optimisticEndTime
    };
    setEventState(optimisticState);
    timerSynchronizer.syncServerState(optimisticState);
    setRemainingTime(timerSynchronizer.getRemainingSeconds());

    try {
      const res = await fetch(`/api/session/${sessNum}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-participant-token': participantToken
        }
      });
      const data = await res.json();
      if (data && data.success && data.eventState) {
        // Use authoritative server state but keep participant_started=true
        const authorizedState = { ...data.eventState, participant_started: true, timer_on_hold: false };
        setEventState(authorizedState);
        timerSynchronizer.syncServerState(authorizedState);
        setRemainingTime(timerSynchronizer.getRemainingSeconds());
      }

      // Fetch questions for the newly started session
      try {
        const qRes = await fetch(`/api/session/${sessNum}/questions`, {
          headers: { 'x-participant-token': participantToken }
        });
        const qData = await qRes.json();
        if (qData && qData.success && qData.questions && qData.questions.length > 0) {
          setCurrentQuestions(qData.questions);
          const firstUnsolved = qData.questions.findIndex((q) => !q.isSolved);
          const targetIdx = firstUnsolved !== -1 ? firstUnsolved : 0;
          setActiveQuestionIndex(targetIdx);
          hasInitializedQuestionIndexRef.current = true;
          lastSessionNumberRef.current = sessNum;
        }
      } catch (qErr) {
        console.warn('[App] Failed to fetch questions after session start:', qErr);
      }

      // After a short delay, do a clean sync (DB has settled by then)
      setTimeout(() => {
        isStartingSessionRef.current = false;
        syncServerState();
      }, 1500);

    } catch (err) {
      console.warn('[App] Failed to start participant session on server:', err);
      isStartingSessionRef.current = false;
      await syncServerState();
    }
  };

  const formatClock = (totalSeconds) => {
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  };

  const isTimerOnHold = Boolean(
    (eventState.status === 'SESSION_1_ACTIVE' || eventState.status === 'SESSION_2_ACTIVE') &&
    (!eventState.participant_started || eventState.timer_on_hold)
  );

  const isWarning = remainingTime <= 300 && remainingTime > 0 && !isTimerOnHold;
  const timerString = formatClock(remainingTime);
  const sessionSolvedCount = currentQuestions.filter((q) => solvedQuestions.includes(q.id)).length;
  const progressPct = currentQuestions.length > 0 ? Math.round((sessionSolvedCount / currentQuestions.length) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER GATES
  // ─────────────────────────────────────────────────────────────────────────────

  // Gate 0: Auth Loading State (Rule 8 — Avoid flashing protected content before verifying token)
  if (authLoading) {
    return (
      <div className="auth-loading-overlay" style={{
        position: 'fixed',
        inset: 0,
        background: '#020503',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00FF9C',
        fontFamily: 'var(--font-mono)'
      }}>
        <Scanlines isCritical={false} />
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '3px solid rgba(0, 255, 156, 0.2)',
          borderTopColor: '#00FF9C',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '20px'
        }} />
        <div style={{ fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.1em' }}>
          AUTHENTICATING OPERATIVE SESSION...
        </div>
        <div style={{ fontSize: '0.78rem', color: '#718078', marginTop: '6px', letterSpacing: '0.05em' }}>
          VERIFYING LATVERIA-NET CLEARANCE & SECURE TOKENS
        </div>
      </div>
    );
  }

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
        <LeaderboardModal
          isOpen={leaderboardOpen}
          onClose={() => setLeaderboardOpen(false)}
          currentTeamName={teamName}
        />
      </div>
    );
  }

  // Gate 1.5: Full-screen Single-Play Video Intro state right after successful login
  if (showVideoIntro) {
    return (
      <VideoIntro onEnded={() => setShowVideoIntro(false)} />
    );
  }

  // Gate 2: Waiting Room for closed/locked states OR when session is active but participant has not started timer yet.
  const isWaitingRoomState = (
    eventState.status === 'CLOSED' ||
    eventState.status === 'SESSION_1_LOCKED' ||
    eventState.status === 'SESSION_2_LOCKED' ||
    eventState.status === 'EVENT_FINISHED' ||
    ((eventState.status === 'SESSION_1_ACTIVE' || eventState.status === 'SESSION_2_ACTIVE') && !eventState.participant_started)
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
        isTimerOnHold={isTimerOnHold}
        isExpired={isTimeExpired}
        progressPct={progressPct}
        evidenceCount={evidenceList.length}
        onOpenEvidence={() => setJournalOpen(true)}
        onOpenHint={() => setHintModalOpen(true)}
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
          onStartSession={handleStartParticipantSession}
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
                  {/* Tactical corner brackets */}
                  <div className="pc-bracket pc-bracket--tl" />
                  <div className="pc-bracket pc-bracket--tr" />
                  <div className="pc-bracket pc-bracket--bl" />
                  <div className="pc-bracket pc-bracket--br" />

                  <div className="doom-intel-console__topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#00FF9C', letterSpacing: '0.08em', fontWeight: '700', textTransform: 'uppercase' }}>
                        LATVERIA-NET DOSSIER
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#718078', letterSpacing: '0.03em' }}>
                      SESSION {currentSessionNumber} · LEVEL {String(displayLevelNumber).padStart(2, '0')} OF 30 ({currentQuestion.category || 'LOGIC'})
                    </span>
                  </div>

                  <div className="doom-intel-console__content">
                    <p className="story-eyebrow" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00FF9C', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                      MISSION INTEL — {currentQuestion.subtitle || 'IF-ELSE DECISIONS'}
                    </p>
                    <h2 className="story-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: '700', color: '#E8F5EE', letterSpacing: '0.02em', margin: '4px 0 16px 0' }}>
                      ROOM {String(displayLevelNumber).padStart(2, '0')}: {currentQuestion.name}
                    </h2>
                    <div className="story-text">
                      {(currentQuestion.story || []).slice(0, revealedParas).map((p, i) => (
                        <div
                          key={i}
                          className="story-para-entry"
                          style={{
                            marginBottom: '1rem',
                            padding: '14px 18px',
                            background: 'rgba(0, 20, 12, 0.45)',
                            borderLeft: i === revealedParas - 1 && revealedParas < (currentQuestion.story || []).length
                              ? '3px solid var(--doom-cyan)'
                              : '3px solid #00FF9C',
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
                            borderBottom: '1px solid rgba(0, 255, 156, 0.15)',
                            paddingBottom: '4px'
                          }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.78rem',
                              color: '#00FF9C',
                              letterSpacing: '0.05em',
                              fontWeight: 700
                            }}>
                              INTEL ENTRY {String(i + 1).padStart(2, '0')} / {String((currentQuestion.story || []).length).padStart(2, '0')}
                            </span>
                            {i === revealedParas - 1 && revealedParas < (currentQuestion.story || []).length ? (
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                color: 'var(--doom-cyan)',
                                background: 'rgba(0, 229, 255, 0.12)',
                                border: '1px solid rgba(0, 229, 255, 0.3)',
                                padding: '1px 6px',
                                borderRadius: '3px',
                                textTransform: 'uppercase'
                              }}>
                                LATEST ENTRY
                              </span>
                            ) : (
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                color: '#718078',
                                textTransform: 'uppercase'
                              }}>
                                STATUS: DECRYPTED
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
                        background: 'rgba(0, 20, 12, 0.5)',
                        border: '1px solid rgba(0, 255, 156, 0.2)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#718078', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            DECRYPTION STATUS
                          </span>
                          <div style={{
                            width: '140px',
                            height: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${Math.round((revealedParas / (currentQuestion.story || []).length) * 100)}%`,
                              height: '100%',
                              background: '#00FF9C',
                              boxShadow: '0 0 8px #00FF9C',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
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
                                  setRevealedParas((prev) => Math.min((currentQuestion.story || []).length, prev + 1));
                                }}
                                style={{
                                  background: 'rgba(0, 255, 156, 0.15)',
                                  border: '1px solid #00FF9C',
                                  color: '#00FF9C',
                                  fontWeight: '700',
                                  fontSize: '0.8rem',
                                  padding: '6px 14px',
                                  letterSpacing: '0.05em',
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  borderRadius: '4px',
                                  fontFamily: 'var(--font-mono)'
                                }}
                              >
                                <span>[ REVEAL NEXT ▼ ]</span>
                              </button>

                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => {
                                  setRevealedParas((currentQuestion.story || []).length);
                                }}
                                style={{
                                  border: '1px solid rgba(0, 255, 156, 0.3)',
                                  color: '#9BAFA5',
                                  fontSize: '0.78rem',
                                  padding: '6px 12px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  cursor: 'pointer',
                                  borderRadius: '4px',
                                  fontFamily: 'var(--font-mono)'
                                }}
                              >
                                [ REVEAL ALL ]
                              </button>
                            </>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                color: '#00FF9C',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                textTransform: 'uppercase'
                              }}>
                                <IconCheck size={14} color="#00FF9C" /> FULL DOSSIER DECRYPTED
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
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                  borderRadius: '4px',
                                  fontFamily: 'var(--font-mono)'
                                }}
                                title="Collapse back to first entry"
                              >
                                COLLAPSE
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
                    attemptsUsed: currentQuestion.attemptsUsed,
                    wrongCount: currentQuestion.wrongCount !== undefined ? currentQuestion.wrongCount : (currentQuestion.isSolved ? Math.max(0, (currentQuestion.attemptsUsed || 1) - 1) : (currentQuestion.attemptsUsed || 0)),
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
        currentTeamName={teamName}
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

