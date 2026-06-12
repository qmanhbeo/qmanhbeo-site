export function translateSceneDirection(campaignDesign, directorState, plan) {
  if (plan.complete) {
    return 'The campaign director has completed every thread. Move toward an ending scene rather than adding a new complication.';
  }

  if (plan.blocked) {
    return `The campaign director could not plan a valid scene: ${plan.reasonCodes.join(', ')}.`;
  }

  const thread = campaignDesign.threads.find((candidate) => candidate.id === plan.focusThreadId);
  const parent = thread?.parentId
    ? campaignDesign.threads.find((candidate) => candidate.id === thread.parentId)
    : null;
  const focusLine = parent
    ? `Focus this scene on ${thread.label}, a ${thread.scope} problem within the larger ${parent.label}.`
    : `Focus this scene on ${thread.label}.`;
  const beatLine = beatInstruction(plan);
  const contextLines = [
    `Stay within the campaign's ${campaignDesign.stakesCeiling}-scale stakes ceiling.`
  ];

  if (thread?.id === campaignDesign.mainThreatId && campaignDesign.mainObjective) {
    contextLines.push(`Main objective: ${campaignDesign.mainObjective}`);
  }

  if (plan.beat === 'resolve' && campaignDesign.coreQuestion) {
    contextLines.push(`Let the resolution answer: ${campaignDesign.coreQuestion}`);
  }

  if (parent && directorState.threadStates[parent.id]?.status !== 'resolved') {
    contextLines.push(`Keep ${parent.label} unresolved in the background.`);
  }

  const forbiddenReveals = [
    ...(Array.isArray(campaignDesign.forbiddenReveals) ? campaignDesign.forbiddenReveals : []),
    ...(Array.isArray(thread?.forbiddenReveals) ? thread.forbiddenReveals : [])
  ];

  if (forbiddenReveals.length > 0) {
    contextLines.push(`Do not reveal: ${forbiddenReveals.join('; ')}.`);
  }

  return [focusLine, '', beatLine, '', ...contextLines].join('\n');
}

function beatInstruction(plan) {
  const modifierText = plan.modifier ? ` Include a ${plan.modifier} modifier.` : '';

  switch (plan.beat) {
    case 'introduce':
      return `Introduce the thread clearly through a concrete sign, rumor, witness, or pressure point.${modifierText}`;
    case 'escalate':
      return `Escalate the threat with a visible consequence or tightening constraint, without resolving it.${modifierText}`;
    case 'hold':
      return `Hold tension steady while giving the player new texture, evidence, or positioning.${modifierText}`;
    case 'partial_release':
      return `Offer partial relief: reduce immediate danger while making meaningful progress toward the thread objective.${modifierText}`;
    case 'resolve':
      return `Resolve this thread decisively and show the immediate consequence of that resolution.${modifierText}`;
    case 'aftermath':
      return 'Deliver the queued aftermath: show consequences, changed relationships, or the emotional cost of the recent resolution.';
    default:
      return `Continue the thread with beat "${plan.beat}".${modifierText}`;
  }
}
