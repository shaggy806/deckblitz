import { defineCard } from "../define.js";

// EDHREC rank 19700. Something Worth Saving's shape: only a card milled by
// this spell can be chosen, and choosing none is fine.
export default defineCard({
  name: "Rapid Rescue",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Mill two cards. You may put a permanent card from among the milled cards into your hand. You gain 2 life. (To mill two cards, put the top two cards of your library into your graveyard.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 2 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { thisWay: "milled", typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
      },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
