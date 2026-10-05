/**
 * Trigger matching for the UI/UX Pro Max auto-invocation plugin.
 *
 * Kept free of Harness imports so it can be unit-tested with plain Node, and so
 * the vocabulary can be reviewed independently of the plugin wiring.
 *
 * @module dsh-ui-ux-pro-max/trigger
 */

/** The skill this plugin auto-loads. */
export const SKILL_NAME = 'ui-ux-pro-max';

/**
 * Trigger vocabulary. Deliberately conservative:
 * - `ui`/`ux` must be standalone tokens, so "build", "guide", "require",
 *   "fluid", "suite" and "quiz" never match.
 * - the phrases below name unambiguous UI/UX work rather than generic words.
 */
export const TRIGGER_PATTERNS = [
  // "ui", "ux", "UI/UX", "ui-ux", "UI + UX" as standalone tokens.
  /(^|[^a-z0-9])(ui|ux)(?![a-z0-9])/i,
  /\bui[\s/_-]*ux\b/i,
  // Explicit design-work phrases, singular and plural.
  /\buser interfaces?\b/i,
  /\buser experiences?\b/i,
  /\bdesign systems?\b/i,
  /\bdesign tokens?\b/i,
  /\bcolou?r palettes?\b/i,
  /\bfont pairings?\b/i,
  /\btypography\b/i,
  /\bresponsive (layouts?|designs?)\b/i,
  /\b(accessibility|a11y) (audits?|reviews?)\b/i,
  /\bdesign (reviews?|critique)\b/i,
  // Chinese equivalents.
  /界面|设计系统|配色方案|排版|交互设计|用户体验/,
];

/**
 * Whether any direct user-authored text block asks for UI/UX work.
 *
 * Only `source.kind === 'user'` counts, matching DSH's built-in `/skill-name`
 * gesture: plugin, tool, skill-injected, and subagent text can never trigger
 * this, so no other component can forge a match.
 *
 * @param messages - the step's claimed message batch.
 * @returns the matched evidence, or undefined when nothing matched.
 */
export function matchTrigger(messages) {
  for (const message of messages) {
    if (message.source?.kind !== 'user') continue;
    for (const block of message.content ?? []) {
      if (block.type !== 'text' || typeof block.text !== 'string') continue;
      for (const pattern of TRIGGER_PATTERNS) {
        const found = block.text.match(pattern);
        if (found !== null) {
          return { pattern: pattern.source, evidence: found[0].slice(0, 80) };
        }
      }
    }
  }
  return undefined;
}

/**
 * Whether this step already carries the skill body.
 *
 * A turn's later steps re-claim the earlier messages, so without this check the
 * body would be appended again on every step of the same turn.
 *
 * @param messages - the step's claimed batch.
 * @returns whether the body is already present.
 */
export function alreadyInjected(messages) {
  return messages.some(
    (message) => message.source?.kind === 'skill-invocation' && message.source?.name === SKILL_NAME,
  );
}

/** Escape prose the way the host's skill renderer does, so framing tags survive. */
export function escapeText(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/** Escape a double-quoted attribute value. */
export function escapeAttr(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

/**
 * Render a skill in the canonical `<skill_content>` shape.
 *
 * Mirrors `renderSkillContent` from `@deepseek-ai/dsh-skill` so the injected
 * block is byte-identical to the one the `skill` tool produces. Used only when
 * that package cannot be resolved from this profile.
 *
 * @param skill - the loaded skill definition.
 * @returns the complete model-facing block.
 */
export function renderSkillContentFallback(skill) {
  const base = skill.resourceBase;
  let hint;
  if (base === undefined) {
    hint = [
      `Resources for this skill are managed by provider "${escapeText(skill.provider ?? 'unknown')}".`,
      'Load referenced resources only as needed.',
    ];
  } else if (base.kind === 'directory') {
    hint = [
      `Base directory for this skill: ${escapeText(base.path)}`,
      'Resolve relative paths mentioned by this skill against the base directory before using them. Load referenced resources only as needed.',
    ];
  } else if (base.kind === 'url') {
    hint = [
      `Base URL for this skill: ${escapeText(base.url)}`,
      'Resolve relative URLs mentioned by this skill against the base URL before using them. Load referenced resources only as needed.',
    ];
  } else {
    hint = [
      `Resources for this skill: ${escapeText(base.description)}`,
      'Load referenced resources only as needed.',
    ];
  }
  return [
    `<skill_content name="${escapeAttr(skill.name)}">`,
    '<skill_resources>',
    ...hint,
    '</skill_resources>',
    '',
    '<skill_instructions>',
    skill.content,
    '</skill_instructions>',
    '</skill_content>',
  ].join('\n');
}
