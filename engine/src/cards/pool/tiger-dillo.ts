import { defineCard } from "../define.js";

// EDHREC rank 22489. Rhonas the Indomitable's restriction: a static's
// `controls` condition leaves this creature itself out, which is the
// "another".

const RESTRICT_TEXT = "This creature can't attack or block unless you control another creature with power 4 or greater.";

export default defineCard({
  name: "Tiger-Dillo",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat", "Armadillo"],
  power: 4,
  toughness: 3,
  text: RESTRICT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: {
          kind: "controls",
          filter: { type: "creature", power: { op: "gte", n: 4 } },
          atLeast: 1,
        },
      },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICT_TEXT,
    },
  ],
});
