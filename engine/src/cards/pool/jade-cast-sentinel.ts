import { defineCard } from "../define.js";

export default defineCard({
  name: "Jade-Cast Sentinel",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Ape", "Snake"],
  power: 1,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach\n{2}, {T}: Put target card from a graveyard on the bottom of its owner's library.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{2}, {T}: Put target card from a graveyard on the bottom of its owner's library.",
    },
  ],
});
