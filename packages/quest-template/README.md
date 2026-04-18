# 🏡 Quest: {{QUEST_TITLE}}

> *{{QUEST_LORE}}*

---

## The Mission

{{QUEST_DESCRIPTION}}

## Rules of the Realm

1. **No AI assistants** — The Hearthside Terminal is a place of craft. Disable Copilot, ChatGPT, and any other AI tools before you begin. Your own ingenuity is the most powerful tool.
2. **No external libraries** — Unless explicitly listed under "Allowed Enchantments", use only what is available in the standard library.
3. **Stay in `src/index.ts`** — That is your canvas. Do not modify `tests/` or `package.json`.

## Allowed Enchantments

- TypeScript standard library
- Node.js built-ins (if applicable)

## Starting the Quest

```bash
funcode fetch {{QUEST_ID}}
cd quest-{{QUEST_ID}}-{{QUEST_SLUG}}
npm install
```

## Running Tests

```bash
funcode test
# or directly:
npm test
```

## Submitting

When all tests pass:

```bash
funcode submit
```

You will receive a **Post-Quest Mentor Report** analyzing your solution for craft, complexity, and edge cases.

---

*Estimated time: {{ESTIMATED_MINUTES}} minutes — {{DIFFICULTY}} difficulty — {{XP_REWARD}} XP*
