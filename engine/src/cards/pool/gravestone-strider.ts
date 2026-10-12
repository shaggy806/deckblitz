import { defineCard } from "../define.js";

export default defineCard({
  name: "Gravestone Strider",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 1,
  toughness: 3,
  text: "{1}: Add one mana of any color. Activate only once each turn.\n{2}, Exile this card from your graveyard: Exile target card from a graveyard.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{1}: Add one mana of any color. Activate only once each turn.",
      oncePerTurn: true,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{2}, Exile this card from your graveyard: Exile target card from a graveyard.",
      zone: "graveyard",
    },
  ],
});
