import { defineCard } from "../define.js";

export default defineCard({
  name: "Vessel of Endless Rest",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, put target card from a graveyard on the bottom of its owner's library.\n{T}: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "When this artifact enters, put target card from a graveyard on the bottom of its owner's library.",
    },
  ],
});
