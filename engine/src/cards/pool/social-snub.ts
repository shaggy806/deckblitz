import { defineCard } from "../define.js";

// EDHREC rank 20004.
//
// "When you cast this spell while you control a creature" is a cast trigger
// of the spell itself whose "while" is part of the trigger event
// (`whileCondition`, rule 603.1 — Ancestral Communion's shape), asked as it's
// cast. The copy is of the spell as it last was on the stack, so it's made
// even if the original was countered in response. The edict asks the active
// player first, then each other player in turn order, and sacrifices every
// chosen creature at once (the ruling).
const COPY_TEXT = "When you cast this spell while you control a creature, you may copy this spell.";
const EDICT_TEXT =
  "Each player sacrifices a creature of their choice. Each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Social Snub",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: `${COPY_TEXT}\n${EDICT_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
      { kind: "lose-life", amount: 1, who: "each-opponent" },
      { kind: "gain-life", amount: 1 },
    ],
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      whileCondition: { kind: "controls", filter: { type: "creature" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy Social Snub?",
        effect: { kind: "copy-spell", target: "trigger-spell" },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
