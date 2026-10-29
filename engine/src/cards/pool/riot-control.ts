import { defineCard } from "../define.js";

// EDHREC rank 2269.
//
// The life is counted as it resolves (the ruling); the prevention covers you
// the player only — not your creatures or planeswalkers (the ruling).

export default defineCard({
  name: "Riot Control",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain 1 life for each creature your opponents control. Prevent all damage that would be dealt to you this turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "opponent" } } },
      { kind: "damage-rule", to: { players: "you" } },
    ],
  },
});
