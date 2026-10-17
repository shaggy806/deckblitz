import { defineCard } from "../define.js";

// EDHREC rank 13368. Wilds of Eldraine. Itzquinth's "you may pay {2}. When
// you do": the creature is chosen as the reflexive ability goes on the stack
// (its ruling), and an already-tapped one still gets the stun counter (its
// other ruling) — Constrictor Sage's tap and counter.
const ENTER_TEXT =
  "When this creature enters, you may pay {2}. When you do, tap target creature an opponent controls and put a stun counter on it.";

export default defineCard({
  name: "Snaremaster Sprite",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text:
    "Flying\nWhen this creature enters, you may pay {2}. When you do, tap target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to tap a creature an opponent controls and put a stun counter on it?",
        cost: "{2}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature-an-opponent-controls"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "tap", target: 0 },
              { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
            ],
          },
          text: "Tap target creature an opponent controls and put a stun counter on it.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
