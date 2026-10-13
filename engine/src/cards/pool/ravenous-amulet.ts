import { defineCard } from "../define.js";

// EDHREC rank 6897.

const DRAW_TEXT =
  "{1}, {T}, Sacrifice a creature: Draw a card and put a soul counter on this artifact. Activate only as a sorcery.";
const DRAIN_TEXT =
  "{4}, {T}, Sacrifice this artifact: Each opponent loses life equal to the number of soul counters on this artifact.";

// The count is the artifact's as it was sacrificed (last-known information,
// rule 608.2h — Blast Zone's shape).
export default defineCard({
  name: "Ravenous Amulet",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${DRAW_TEXT}\n${DRAIN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "add-counter", target: "source", counter: "soul", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "lose-life",
        who: "each-opponent",
        amount: { countersOn: "source", counter: "soul" },
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
