import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 24656.
//
// Once per blocker (`blocked-by`), a delayed "at end of combat" trigger
// (Infernal Medusa's shape) about that blocker. The control change has no
// duration, and doesn't care whether the Entrancer is still around (its
// ruling): an untimed `gain-control` from the delayed trigger, whose
// controller is the Entrancer's.

const TEXT = "Whenever this creature becomes blocked by a creature, gain control of that creature at end of combat.";

export default defineCard({
  name: "Tolarian Entrancer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "gain-control", target: "trigger-object", untilEndOfTurn: false },
        text: "At end of combat, gain control of that creature.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
