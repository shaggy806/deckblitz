import { defineCard } from "../define.js";

export default defineCard({
  name: "Crossroads Candleguide",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 3,
  toughness: 4,
  text: "When this creature enters, exile up to one target card from a graveyard.\n{2}: Add one mana of any color.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{2}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "When this creature enters, exile up to one target card from a graveyard.",
    },
  ],
});
