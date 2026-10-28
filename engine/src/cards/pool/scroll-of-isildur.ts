import { defineCard } from "../define.js";

const I_TEXT = "I — Gain control of up to one target artifact for as long as you control this Saga. The Ring tempts you.";
const II_TEXT = "II — Tap up to two target creatures. Put a stun counter on each of them.";
const III_TEXT = "III — Draw a card for each tapped creature target opponent controls.";

export default defineCard({
  name: "Scroll of Isildur",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: "artifact" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
          { kind: "the-ring-tempts-you" },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          { kind: "add-counter", target: 1, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: ["opponent"],
      effect: {
        kind: "draw",
        amount: { countOf: { type: "creature", tapped: true, controlledBy: "you" }, forTarget: 0 },
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
