import { defineCard } from "../define.js";

// EDHREC rank 7060. Its own slivercycling (rule 702.29e) and the one it gives
// every Sliver card in every player's hand.
export default defineCard({
  name: "Homing Sliver",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "Each Sliver card in each player's hand has slivercycling {3}.\nSlivercycling {3} ({3}, Discard this card: Search your library for a Sliver card, reveal it, put it into your hand, then shuffle.)",
  cycling: { cost: "{3}", search: { subtype: "Sliver" } },
  static: [
    {
      affects: { scope: "self" },
      grantsToHand: { filter: { subtype: "Sliver" }, eachPlayer: true, keywordValues: [{ keyword: "cycling", cost: "{3}", search: { subtype: "Sliver" } }] },
      text: "Each Sliver card in each player's hand has slivercycling {3}.",
    },
  ],
});
