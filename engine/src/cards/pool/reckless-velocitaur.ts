import { defineCard } from "../define.js";

// "During your main phase" is part of when it triggers; nothing can move the
// turn on while it's on the stack, so asking it again as it resolves agrees.
const TAPS_TEXT =
  "Whenever this creature saddles a Mount or crews a Vehicle during your main phase, that Mount or Vehicle gets +2/+0 and gains trample until end of turn.";

export default defineCard({
  name: "Reckless Velocitaur",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Pilot"],
  power: 3,
  toughness: 3,
  text: TAPS_TEXT,
  triggered: [
    {
      trigger: { on: "crews-or-saddles", who: "self", as: ["crew", "saddle"] },
      condition: {
        kind: "all",
        of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] }],
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TAPS_TEXT,
    },
  ],
});
