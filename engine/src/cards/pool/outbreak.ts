import { defineCard } from "../define.js";

// EDHREC rank 29969.

export default defineCard({
  name: "Outbreak",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You may discard a Swamp card rather than pay this spell's mana cost.\nChoose a creature type. All creatures of that type get -1/-1 until end of turn.",
  alternativeCost: { mana: "{0}", discard: { filter: { subtype: "Swamp" }, text: "a Swamp card" } },
  targets: [],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "modify-pt-all",
      filter: { type: "creature", subtype: "$chosen" },
      power: -1,
      toughness: -1,
      duration: "end-of-turn",
    },
  },
});
