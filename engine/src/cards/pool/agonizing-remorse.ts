import { defineCard } from "../define.js";

// One choice over the revealed hand's nonland cards and every card in the
// graveyard (a land too — its ruling), a card exiled if any may be (its
// ruling), then the life loss whatever was found.
const TEXT =
  "Target opponent reveals their hand. You choose a nonland card from it or a card from their graveyard. " +
  "Exile that card. You lose 1 life.";

export default defineCard({
  name: "Agonizing Remorse",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "discard-chosen",
        target: 0,
        filter: { notTypes: ["land"] },
        destination: "exile",
        alsoFrom: { zone: "graveyard" },
      },
      { kind: "lose-life", amount: 1 },
    ],
  },
});
