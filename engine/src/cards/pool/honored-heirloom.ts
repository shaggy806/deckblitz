import { defineCard } from "../define.js";

export default defineCard({
  name: "Honored Heirloom",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add one mana of any color.\n{2}, {T}: Exile target card from a graveyard.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{2}, {T}: Exile target card from a graveyard.",
    },
  ],
});
