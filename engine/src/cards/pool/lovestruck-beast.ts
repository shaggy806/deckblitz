import { defineCard } from "../define.js";

// EDHREC rank 13005. "Unless you control a 1/1 creature" counts the Beast
// itself (the ruling: reduced to 1/1, it can attack alone) — `countsSelf`.
// Checked only as attackers are declared: once attacking it stays attacking.

const TEXT = "This creature can't attack unless you control a 1/1 creature.";

export default defineCard({
  name: "Lovestruck Beast",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast", "Noble"],
  power: 5,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: {
          kind: "controls",
          filter: { type: "creature", power: { op: "eq", n: 1 }, toughness: { op: "eq", n: 1 } },
          atLeast: 1,
          countsSelf: true,
        },
      },
      restrictions: ["cant-attack"],
      text: TEXT,
    },
  ],
  faces: ["Lovestruck Beast", "Heart's Desire"],
  adventure: true,
});
