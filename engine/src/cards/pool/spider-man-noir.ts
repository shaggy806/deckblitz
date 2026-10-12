import { defineCard } from "../define.js";

// EDHREC rank 8880.

// Peggy Carter's "attacks alone"; X is every counter of every kind on the
// attacker (`countersOn` with no kind), counted after the +1/+1 counter goes
// on, as the surveil happens.
const ALONE_TEXT =
  "Whenever a creature you control attacks alone, put a +1/+1 counter on it. Then surveil X, where X is the number of counters on it.";

export default defineCard({
  name: "Spider-Man Noir",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${ALONE_TEXT} (Look at the top X cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          { kind: "surveil", amount: { countersOn: "trigger-object" } },
        ],
      },
      resolve: null,
      text: ALONE_TEXT,
    },
  ],
});
