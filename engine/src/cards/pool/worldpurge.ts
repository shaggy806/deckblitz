import { defineCard } from "../define.js";

// EDHREC rank 23849. Upheaval's return, then each player in turn order
// chooses up to seven cards of their hand to keep, hidden from the rest
// (rule 101.4a), and every hand's rest goes in at once (`sacrifice-all-but`
// `fromHand`, `rest: "shuffle-into-library"`); the mana goes last.
export default defineCard({
  name: "Worldpurge",
  manaCost: "{4}{W/U}{W/U}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text:
    "Return all permanents to their owners' hands. Each player chooses up to seven cards in their hand, then shuffles the rest into their library. Each player loses all unspent mana.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand-all", filter: {} },
      {
        kind: "sacrifice-all-but",
        who: "each-player",
        keep: 7,
        upTo: true,
        filter: {},
        fromHand: true,
        rest: "shuffle-into-library",
      },
      { kind: "lose-unspent-mana", who: "each-player" },
    ],
  },
});
