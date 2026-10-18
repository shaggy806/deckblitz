import { defineCard } from "../define.js";

// EDHREC rank 22953.
//
// "Unless an opponent has three or more poison counters" is checked as the
// trigger resolves (not an intervening if); the sacrifice is any creature
// you control, this one included.
const ENTERS_TEXT =
  "Corrupted — When this creature enters, sacrifice a creature unless an opponent has three or more poison counters.";

export default defineCard({
  name: "Ravenous Necrotitan",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 6,
  toughness: 6,
  text: ENTERS_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 } },
        then: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
