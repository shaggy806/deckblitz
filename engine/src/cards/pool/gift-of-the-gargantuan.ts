import { defineCard } from "../define.js";

// EDHREC rank 23114. Shards of Alara. A creature card, then a land card, each
// optional and revealed as it's taken (Explore the Vastlands' shape). A
// creature land (Dryad Arbor) may answer either pick, as the ruling allows.
export default defineCard({
  name: "Gift of the Gargantuan",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top four cards of your library. You may reveal a creature card and/or a land card from among them and put the revealed cards into your hand. Put the rest on the bottom of your library in any order.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "hand",
    secondPick: { filter: { type: "land" }, min: 0, max: 1, destination: "hand" },
    leftover: "bottom-any-order",
  },
});
