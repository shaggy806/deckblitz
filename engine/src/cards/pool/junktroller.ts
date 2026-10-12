import { defineCard } from "../define.js";

export default defineCard({
  name: "Junktroller",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 6,
  keywords: ["defender"],
  text: "Defender\n{T}: Put target card from a graveyard on the bottom of its owner's library.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{T}: Put target card from a graveyard on the bottom of its owner's library.",
    },
  ],
});
