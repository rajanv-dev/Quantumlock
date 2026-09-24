// Narrative and reactive dialogue state engine for DOOM

import { DOOM_EMOTIONS } from '../data/doomDialogue';
import { contentStore } from './contentStore';

export class NarrativeEngine {
  constructor(initialState = {}) {
    this.storyFlags = initialState.storyFlags || {};
    this.playerChoices = initialState.playerChoices || [];
    this.wrongAttemptsByLevel = initialState.wrongAttemptsByLevel || {};
    this.doomMood = initialState.doomMood || DOOM_EMOTIONS.IDLE;
    this.contradictionsDetected = initialState.contradictionsDetected || [];
    this.currentDialogue = null;
    this.listeners = new Set();
  }

  getDialogues() {
    return contentStore.getContent().levelDialogues || {};
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = this.getStateSnapshot();
    this.listeners.forEach(cb => cb(snapshot));
  }

  getStateSnapshot() {
    return {
      storyFlags: { ...this.storyFlags },
      playerChoices: [...this.playerChoices],
      wrongAttemptsByLevel: { ...this.wrongAttemptsByLevel },
      doomMood: this.doomMood,
      contradictionsDetected: [...this.contradictionsDetected],
      currentDialogue: this.currentDialogue ? { ...this.currentDialogue } : null
    };
  }

  // Trigger level introduction dialogue
  onLevelStart(levelKey) {
    const dialogues = this.getDialogues();
    const levelData = dialogues[levelKey];
    if (!levelData || !levelData.intro) return null;

    const intro = levelData.intro;
    this.doomMood = intro.emotion || DOOM_EMOTIONS.SPEAKING;

    // Tailor intro if player has made past choices
    let text = intro.text;
    if (this.storyFlags.attitude_defiant && levelKey !== 'level_1') {
      text = `[MONITORING DEFIECE] Still struggling, rebels? ` + text;
    } else if (this.storyFlags.attitude_analytical && levelKey !== 'level_1') {
      text = `[AUDITING OPERANDS] Let us see if your analytical discipline holds here. ` + text;
    }

    this.currentDialogue = {
      id: intro.id,
      speaker: intro.speaker || 'DOOM',
      text: text,
      emotion: intro.emotion,
      choices: intro.choices || [],
      isDismissable: true
    };

    this.notify();
    return this.currentDialogue;
  }

  // Trigger dialogue choice response
  onDialogueChoice(choice) {
    if (!choice) return;

    if (choice.flag) {
      this.storyFlags[choice.flag] = true;
    }
    this.playerChoices.push(choice.id);

    if (choice.doomReply) {
      this.doomMood = choice.emotion || DOOM_EMOTIONS.SPEAKING;
      this.currentDialogue = {
        id: `reply_${choice.id}`,
        speaker: 'DOOM',
        text: choice.doomReply,
        emotion: choice.emotion || DOOM_EMOTIONS.SPEAKING,
        choices: [],
        isDismissable: true
      };

    } else {
      this.currentDialogue = null;
    }

    this.notify();
    return this.currentDialogue;
  }

  // Trigger wrong answer reaction
  onWrongAnswer(levelKey) {
    const attempts = (this.wrongAttemptsByLevel[levelKey] || 0) + 1;
    this.wrongAttemptsByLevel[levelKey] = attempts;

    const levelData = this.getDialogues()[levelKey];
    let reaction = {
      emotion: DOOM_EMOTIONS.AMUSED,
      text: "Incorrect. The matrix rejects your input."
    };

    if (levelData && levelData.wrongAnswers && levelData.wrongAnswers.length > 0) {
      const idx = Math.min(attempts - 1, levelData.wrongAnswers.length - 1);
      reaction = levelData.wrongAnswers[idx];
    }

    this.doomMood = reaction.emotion;
    this.currentDialogue = {
      id: `wrong_${levelKey}_${attempts}`,
      speaker: 'DOOM',
      text: reaction.text,
      emotion: reaction.emotion,
      choices: [],
      isDismissable: true
    };

    this.notify();
    return this.currentDialogue;
  }

  // Trigger correct answer reaction
  onCorrectAnswer(levelKey) {
    const levelData = this.getDialogues()[levelKey];
    let reaction = {
      emotion: DOOM_EMOTIONS.CALCULATING,
      text: "Access granted. Advancing to next node."
    };

    if (levelData && levelData.correctAnswer) {
      reaction = levelData.correctAnswer;
    }

    this.doomMood = reaction.emotion;
    this.currentDialogue = {
      id: `correct_${levelKey}`,
      speaker: 'DOOM',
      text: reaction.text,
      emotion: reaction.emotion,
      choices: [],
      isDismissable: true
    };

    this.notify();
    return this.currentDialogue;
  }

  // Trigger hint request reaction
  onHintUsed(levelKey) {
    this.storyFlags[`hint_used_${levelKey}`] = true;
    const levelData = this.getDialogues()[levelKey];
    if (levelData && levelData.hintReaction) {
      const reaction = levelData.hintReaction;
      this.doomMood = reaction.emotion;
      this.currentDialogue = {
        id: `hint_${levelKey}`,
        speaker: 'DOOM',
        text: reaction.text,
        emotion: reaction.emotion,
        choices: [],
        isDismissable: true
      };
      this.notify();
    }
  }

  // Flag a contradiction/lie
  flagContradiction(contradictionKey) {
    if (!this.contradictionsDetected.includes(contradictionKey)) {
      this.contradictionsDetected.push(contradictionKey);
      this.storyFlags[`contradiction_${contradictionKey}`] = true;

      const responseText = "CONTRADICTION EXPOSED: You caught DOOM falsifying telemetry records. Security countermeasures degraded by 5%.";
      this.doomMood = DOOM_EMOTIONS.GLITCHING;
      this.currentDialogue = {
        id: `exposed_${contradictionKey}`,
        speaker: 'TACTICAL RADAR',
        text: responseText,
        emotion: DOOM_EMOTIONS.GLITCHING,
        choices: [],
        isDismissable: true
      };

      this.notify();
      return true;
    }
    return false;
  }

  dismissDialogue() {
    this.currentDialogue = null;
    this.doomMood = DOOM_EMOTIONS.IDLE;
    this.notify();
  }
}

export const narrativeEngine = new NarrativeEngine();
