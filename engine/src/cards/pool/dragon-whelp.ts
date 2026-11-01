import { defineCard } from "../define.js";

// EDHREC rank 19492.
//
// The count is of activations this turn, resolved or not, the one resolving
// among them, read as each activation resolves: with four on the stack, each
// of them sets up a sacrifice. Each sacrifice is of this object only (rule
// 400.7) — one that has left and come back by then isn't sacrificed.
const PUMP_TEXT =
  "{R}: This creature gets +1/+0 until end of turn. If this ability has been activated four or more times this turn, sacrifice this creature at the beginning of the next end step.";

export default defineCard({
  name: "Dragon Whelp",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "activated-this-turn", atLeast: 4 },
            then: {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "sacrifice-source" },
              text: "Sacrifice Dragon Whelp.",
            },
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
