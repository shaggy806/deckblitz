import { defineCard } from "../define.js";

// EDHREC rank 20847.
// Makes Soldier → use "Soldier Token".

export default defineCard({
  name: "Timely Reinforcements",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "If you have less life than an opponent, you gain 6 life. If you control fewer creatures than an opponent, create three 1/1 white Soldier creature tokens.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "player-compare", stat: "life", compare: "fewer", than: "an-opponent" },
        then: { kind: "gain-life", amount: 6 },
      },
      {
        kind: "conditional",
        condition: { kind: "opponent-controls-more", filter: { type: "creature" } },
        then: { kind: "create-token", token: "Soldier Token", count: 3 },
      },
    ],
  },
});
