// Validate the trigger matcher against positive and negative cases.
// Run from the plugin directory: node tests/test-trigger.mjs
import { matchTrigger, alreadyInjected } from '../trigger.js';

const user = (text) => ({ source: { kind: 'user' }, content: [{ type: 'text', text }] });

const shouldTrigger = [
  '帮我做一个 landing page 的 UI',
  'Build a UI for my SaaS dashboard',
  'improve the ux of this form',
  '做一个好看的界面',
  'UI/UX review please',
  'redesign the ui-ux of the app',
  'Set up a design system',
  'pick a color palette for this brand',
  'verify color palettes meet contrast',
  'audit the design system components',
  'the typography feels off',
  'fix the responsive layout on mobile',
  'multiple responsive layouts',
  'run an accessibility audit',
  'a11y reviews for the release',
  'do a design review',
  'UI',
  'ui',
  '请优化用户体验',
  'design tokens for the theme',
  'check the font pairing',
  'improve the user experience',
];
const shouldNotTrigger = [
  'build the project',
  'read the guide',
  'require a token',
  'fluid simulation',
  'suite of tests',
  'a quick quiz',
  'suit up',
  'rebuild the backend API',
  'add a database index',
  'explain this build error',
  'run the unit tests',
  'git status please',
  'REQUIREMENTS.md',
  'the build fails on linux',
  'increase the sampling rate',
];

let failures = 0;
const check = (ok, label) => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
};

console.log('=== should trigger ===');
for (const t of shouldTrigger) {
  const m = matchTrigger([user(t)]);
  check(m !== undefined, `${JSON.stringify(t)}${m ? `  <- ${JSON.stringify(m.evidence)}` : ''}`);
}

console.log('\n=== should NOT trigger ===');
for (const t of shouldNotTrigger) {
  const m = matchTrigger([user(t)]);
  check(m === undefined, `${JSON.stringify(t)}${m ? `  <- FALSE MATCH ${JSON.stringify(m.evidence)}` : ''}`);
}

console.log('\n=== source isolation (non-user text must never trigger) ===');
for (const kind of ['model', 'tool', 'skill-catalog', 'agent-instructions', 'subagent-settled', 'runtime-context']) {
  const m = matchTrigger([{ source: { kind }, content: [{ type: 'text', text: 'build a UI' }] }]);
  check(m === undefined, `source.kind=${kind}`);
}

console.log('\n=== non-text blocks ===');
check(matchTrigger([{ source: { kind: 'user' }, content: [{ type: 'image' }] }]) === undefined, 'image-only message');

console.log('\n=== once-per-turn guard ===');
const body = { source: { kind: 'skill-invocation', name: 'ui-ux-pro-max' }, content: [] };
check(alreadyInjected([body]) === true, 'detects an existing injection');
check(alreadyInjected([user('build a UI')]) === false, 'ignores unrelated messages');
check(
  alreadyInjected([{ source: { kind: 'skill-invocation', name: 'other-skill' }, content: [] }]) === false,
  'ignores another skill',
);

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
