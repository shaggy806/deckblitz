import { defineCard } from "../define.js";

// EDHREC rank 7156. Any kind of counter, put by you on a creature you control
// — itself included, and counters it enters with (rule 122.6).
const TEXT =
  "Whenever you put a counter on a creature you control, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Mikey & Leo, Chaos & Order",
  manaCost: "{G/W}{G/W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "counters-put", who: "you-control", filter: { type: "creature" }, byYou: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
