import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 17929.
//
// The target gone illegal, the spell doesn't resolve and nothing is looked at
// (its ruling — rule 608.2b). With one card left in the library, it goes to
// the hand.

export default defineCard({
  name: "Ral's Outburst",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Ral's Outburst deals 3 damage to any target. Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "look-and-choose", zone: "library", count: 2, min: 1, max: 1, destination: "hand", leftover: "graveyard" },
    ],
  },
});
