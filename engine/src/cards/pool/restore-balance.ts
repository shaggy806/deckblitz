import { defineCard } from "../define.js";

// Lands, then creatures, then cards, as the rulings order them; each part
// reads the fewest as it begins.
const fewest = (filter: { readonly type: "land" | "creature" }) =>
  ({ amongPlayers: "least", of: { countOf: { ...filter, controlledBy: "you" }, forEachPlayer: true } }) as const;

export default defineCard({
  name: "Restore Balance",
  colors: ["W"],
  types: ["sorcery"],
  suspend: { n: 6, cost: "{W}" },
  text: "Suspend 6—{W}\nEach player chooses a number of lands they control equal to the number of lands controlled by the player who controls the fewest, then sacrifices the rest. Players sacrifice creatures and discard cards the same way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice-all-but", who: "each-player", keep: fewest({ type: "land" }), filter: { type: "land" } },
      { kind: "sacrifice-all-but", who: "each-player", keep: fewest({ type: "creature" }), filter: { type: "creature" } },
      {
        kind: "discard",
        target: "each-player",
        amount: { difference: [{ cardsInHand: "each" }, { amongPlayers: "least", of: { cardsInHand: "each" } }] },
      },
    ],
  },
});
