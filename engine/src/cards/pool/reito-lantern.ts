import { defineCard } from "../define.js";

export default defineCard({
  name: "Reito Lantern",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{3}: Put target card from a graveyard on the bottom of its owner's library.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{3}: Put target card from a graveyard on the bottom of its owner's library.",
    },
  ],
});
