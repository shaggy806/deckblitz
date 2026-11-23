import { defineCard } from "../define.js";

// Playtest card. The counters are read off the sacrificed artifact as it last existed (rule 608.2h).

const SACRIFICE =
  "{T}, Sacrifice this artifact: You draw two cards and lose 4 life. Then you gain 1 life for each acquired taste counter on this artifact.";

export default defineCard({
  name: "Moth Herb Elixir",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Put an acquired taste counter on this artifact.\n${SACRIFICE}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "acquired taste", amount: 1 },
      resolve: null,
      text: "{T}: Put an acquired taste counter on this artifact.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "lose-life", amount: 4, who: "you" },
          { kind: "gain-life", amount: { countersOn: "source", counter: "acquired taste" } },
        ],
      },
      resolve: null,
      text: SACRIFICE,
    },
  ],
});
