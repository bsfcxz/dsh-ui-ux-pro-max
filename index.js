/**
 * UI/UX Pro Max auto-invocation.
 *
 * When a step's claimed direct user input mentions UI/UX work, this plugin
 * loads the `ui-ux-pro-max` skill and splices its body into that same step, so
 * the model receives the full design intelligence without first having to
 * choose the `skill` tool.
 *
 * It reuses the exact `agent/pre-step` splice and `skill-invocation` message
 * source that DSH's own `/skill-name` gesture uses, so the injected body is
 * durable, replayable, and rendered by the host's own skill renderer.
 *
 * @module dsh-ui-ux-pro-max
 */
import { SKILL_NAME, alreadyInjected, matchTrigger, renderSkillContentFallback } from './trigger.js';

/** Bundle/plugin identity, matching `cordis.patch.yml`. */
export const name = 'ui-ux-pro-max-auto';

/**
 * `skills` is required: without the registry the plugin cannot resolve a body,
 * so it stays inactive in profiles that lack the service.
 */
export const inject = ['skills'];

/**
 * Resolve the host's message factory and skill renderer.
 *
 * Those packages belong to the DSH installation rather than this bundle, so
 * they are imported lazily: a resolution problem degrades the wrapper shape
 * instead of stopping the plugin from loading at all.
 *
 * @returns the helpers, with `undefined` where the host package is unavailable.
 */
async function loadHostHelpers() {
  const helpers = { createUserMessage: undefined, renderSkillContent: undefined };
  try {
    helpers.createUserMessage = (await import('@deepseek-ai/dsh-llm')).createUserMessage;
  } catch {
    /* fall back to a plain identified message below */
  }
  try {
    helpers.renderSkillContent = (await import('@deepseek-ai/dsh-skill')).renderSkillContent;
  } catch {
    /* fall back to the local renderer below */
  }
  return helpers;
}

/** Build the injected message, preferring the host's own factory. */
function buildInjectedMessage({ createUserMessage, text }) {
  const source = { kind: 'skill-invocation', name: SKILL_NAME, form: 'instructions' };
  const content = [{ type: 'text', text }];
  if (createUserMessage !== undefined) return createUserMessage({ content, source });
  return { id: crypto.randomUUID(), role: 'user', content, source };
}

/**
 * Register the automatic skill loader.
 *
 * @param ctx - the plugin context.
 */
export function apply(ctx) {
  const helpers = loadHostHelpers();

  ctx.on('agent/pre-step', async ({ agent, messages, signal }, next) => {
    const decision = await next();
    if (decision.kind === 'reject') return decision;
    if (alreadyInjected(decision.messages)) return decision;

    const trigger = matchTrigger(messages);
    if (trigger === undefined) return decision;
    signal.throwIfAborted();

    let skill;
    try {
      skill = await ctx.skills.get(SKILL_NAME, {
        cwd: agent.session.header.cwd,
        signal,
        scope: agent,
      });
    } catch (error) {
      ctx.logger?.warn?.(`ui-ux-pro-max: skill lookup failed: ${String(error)}`);
      return decision;
    }
    signal.throwIfAborted();

    // Respect the skill's own invocation policy, as the built-in gesture does.
    if (skill === undefined || skill.invocation?.userInvocable === false) {
      ctx.logger?.warn?.(`ui-ux-pro-max: skill "${SKILL_NAME}" is missing or not user-invocable`);
      return decision;
    }

    const resolved = await helpers;
    const text =
      resolved.renderSkillContent !== undefined
        ? resolved.renderSkillContent(skill)
        : renderSkillContentFallback(skill);

    const injected = buildInjectedMessage({ createUserMessage: resolved.createUserMessage, text });

    ctx.logger?.info?.(
      `ui-ux-pro-max: auto-loaded for ${JSON.stringify(trigger.evidence)} (${trigger.pattern})`,
    );

    return { ...decision, messages: [...decision.messages, injected] };
  });
}
