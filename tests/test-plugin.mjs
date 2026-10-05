// Simulate the plugin's pre-step listener end to end with a stubbed context,
// so the wiring (not just the matcher) is exercised before installation.
import { apply } from '../index.js';
import { alreadyInjected } from '../trigger.js';

const SKILL = {
  name: 'ui-ux-pro-max',
  description: 'UI/UX design intelligence.',
  provider: 'filesystem',
  source: 'user-dsh',
  invocation: { modelInvocable: true, userInvocable: true },
  resourceBase: { kind: 'directory', path: 'C:/Users/a1332/.dsh/skills/ui-ux-pro-max' },
  content: '# UI/UX Pro Max\n\nDesign intelligence body.',
};

/** Build a context that records the listener and logs. */
function makeCtx({ skill = SKILL, failLookup = false, missingSkill = false } = {}) {
  const listeners = new Map();
  const logs = [];
  return {
    logs,
    ctx: {
      on(event, handler) { listeners.set(event, handler); },
      logger: { info: (m) => logs.push(['info', m]), warn: (m) => logs.push(['warn', m]) },
      skills: {
        async get(name) {
          if (failLookup) throw new Error('registry offline');
          if (missingSkill) return undefined;
          return name === 'ui-ux-pro-max' ? skill : undefined;
        },
      },
    },
    fire: (payload, next) => listeners.get('agent/pre-step')(payload, next),
  };
}

const userMsg = (text) => ({
  id: 'u1', role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text }],
});
const agent = { session: { header: { cwd: 'C:/Users/a1332/Desktop/bsfc' } } };
const signal = new AbortController().signal;
const enter = (messages) => ({ kind: 'enter', messages, startsRequestSeries: true });

let failures = 0;
const check = (ok, label) => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`); };

// 1. UI request -> body spliced in, original messages preserved.
{
  const { ctx, fire, logs } = makeCtx();
  apply(ctx);
  const messages = [userMsg('甯垜鍋氫竴涓?UI 鐣岄潰')];
  const out = await fire({ agent, messages, signal }, async () => enter(messages));
  check(out.kind === 'enter', 'returns an enter decision');
  check(out.messages.length === 2, 'splices exactly one message');
  check(out.messages[0] === messages[0], 'keeps the original user message first');
  const injected = out.messages[1];
  check(injected.source.kind === 'skill-invocation', 'uses the skill-invocation source');
  check(injected.source.name === 'ui-ux-pro-max', 'names the skill');
  check(injected.content[0].text.includes('<skill_instructions>'), 'renders the skill_content wrapper');
  check(injected.content[0].text.includes('Design intelligence body.'), 'includes the skill body');
  check(logs.some(([l]) => l === 'info'), 'logs the auto-load');
}

// 2. Non-UI request -> untouched.
{
  const { ctx, fire } = makeCtx();
  apply(ctx);
  const messages = [userMsg('rebuild the backend API')];
  const out = await fire({ agent, messages, signal }, async () => enter(messages));
  check(out.messages.length === 1, 'leaves a non-UI request unchanged');
}

// 3. Already injected -> no duplicate.
{
  const { ctx, fire } = makeCtx();
  apply(ctx);
  const messages = [userMsg('build a UI')];
  const first = await fire({ agent, messages, signal }, async () => enter(messages));
  check(first.messages.length === 2, 'first step injects');
  const second = await fire({ agent, messages: first.messages, signal }, async () => enter(first.messages));
  check(second.messages.length === 2, 'second step does not inject again');
  check(alreadyInjected(second.messages), 'guard reports the body present');
}

// 4. Rejected step -> untouched.
{
  const { ctx, fire } = makeCtx();
  apply(ctx);
  const messages = [userMsg('build a UI')];
  const out = await fire({ agent, messages, signal }, async () => ({ kind: 'reject' }));
  check(out.kind === 'reject', 'passes a reject decision through');
}

// 5. Registry failure -> fail-safe, no throw.
{
  const { ctx, fire, logs } = makeCtx({ failLookup: true });
  apply(ctx);
  const messages = [userMsg('build a UI')];
  const out = await fire({ agent, messages, signal }, async () => enter(messages));
  check(out.messages.length === 1, 'leaves the step unchanged when lookup throws');
  check(logs.some(([l]) => l === 'warn'), 'warns about the lookup failure');
}

// 6. Missing skill -> fail-safe.
{
  const { ctx, fire, logs } = makeCtx({ missingSkill: true });
  apply(ctx);
  const messages = [userMsg('build a UI')];
  const out = await fire({ agent, messages, signal }, async () => enter(messages));
  check(out.messages.length === 1, 'leaves the step unchanged when the skill is missing');
  check(logs.some(([l]) => l === 'warn'), 'warns about the missing skill');
}

// 7. user-invocable: false -> respected.
{
  const { ctx, fire } = makeCtx({
    skill: { ...SKILL, invocation: { modelInvocable: true, userInvocable: false } },
  });
  apply(ctx);
  const messages = [userMsg('build a UI')];
  const out = await fire({ agent, messages, signal }, async () => enter(messages));
  check(out.messages.length === 1, 'respects user-invocable: false');
}

// 8. A wrapping listener's extra fields survive.
{
  const { ctx, fire } = makeCtx();
  apply(ctx);
  const messages = [userMsg('build a UI')];
  const out = await fire({ agent, messages, signal }, async () => enter(messages));
  check(out.startsRequestSeries === true, 'preserves other decision fields');
}

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);

