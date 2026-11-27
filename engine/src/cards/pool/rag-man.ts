import { defineCard } from "../define.js";

// The Dark. EDHREC rank 27624.
//
// The hand is revealed, then one creature card in it is discarded at random
// (`discard` with `random` and a `filter`: the game picks among the matching
// cards only). With no creature card, nothing is discarded.

const TEXT =
  "{B}{B}{B}, {T}: Target opponent reveals their hand and discards a creature card at random. Activate only during your turn.";

export default defineCard({
  name: "Rag Man",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}{B}{B}", tap: true },
      targets: ["opponent"],
      condition: { kind: "your-turn" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "reveal-hand", who: 0 },
          { kind: "discard", target: 0, amount: 1, random: true, filter: { type: "creature" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
