// src/utils/sceneDirection.js
//
// Deterministic scene direction generator.
// Returns a short human-readable string like a DM note, or empty string.
// No LLM calls. No new data structures. Pure function of existing gameMemory.

import {
  getCurrentChapterNode,
  getCurrentSceneWaveRole,
} from './storyBlueprintPlanner';

export function deriveSceneDirection(gameMemory) {
  const { arc = {} } = gameMemory;
  const storyBlueprint = arc.storyBlueprint ?? null;
  const sceneWaveRole = getCurrentSceneWaveRole(storyBlueprint);
  const chapterNode = getCurrentChapterNode(storyBlueprint);
  const mustResolve = chapterNode?.mustResolve || '';
  const activeThreads = arc.activeThreads || [];

  if (!sceneWaveRole && !mustResolve && activeThreads.length === 0) {
    return '';
  }

  const lines = [];

  if (sceneWaveRole === 'open') {
    lines.push('Establish the current situation clearly. Introduce curiosity or a new thread. Avoid payoff or major escalation.');
  } else if (sceneWaveRole === 'build') {
    lines.push('Escalate existing tension. Complicate the situation. Do not resolve the main problem yet.');
  } else if (sceneWaveRole === 'resolve') {
    lines.push('Pay off or answer a tension. If the player action logically allows it, resolve a concrete problem. Do not introduce new mysteries.');
  } else if (sceneWaveRole === 'cooldown') {
    lines.push('Let the scene breathe. Show consequences, recovery, or a clue pointing to the larger threat.');
  }

  if (activeThreads.length > 0) {
    lines.push(`Active threads: ${activeThreads.join(', ')}.`);
  }

  if (mustResolve) {
    if (sceneWaveRole === 'resolve') {
      lines.push(`If the story has logically earned it, resolve this chapter obligation: ${mustResolve}.`);
    } else {
      lines.push(`Keep building toward this chapter obligation without resolving it yet: ${mustResolve}.`);
    }
  }

  return lines.join('\n');
}
