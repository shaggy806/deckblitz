import { defineCard } from "../define.js";

// As Balance: each part reads "the player who controls the fewest" as it begins.
export default defineCard({
  name: "Balancing Act",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each player chooses a number of permanents they control equal to the number of permanents controlled by the player who controls the fewest, then sacrifices the rest. Each player discards cards the same way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sacrifice-all-but",
        who: "each-player",
        keep: { amongPlayers: "least", of: { countOf: { controlledBy: "you" }, forEachPlayer: true } },
        filter: {},
      },
      {
        kind: "discard",
        target: "each-player",
        amount: { difference: [{ cardsInHand: "each" }, { amongPlayers: "least", of: { cardsInHand: "each" } }] },
      },
    ],
  },
});
