import { defineCard } from "../define.js";

export default defineCard({
  name: "Magic Pot",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Goblin", "Construct"],
  power: 1,
  toughness: 4,
  text: "When this creature dies, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")\n{2}, {T}: Exile target card from a graveyard.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{2}, {T}: Exile target card from a graveyard.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "When this creature dies, create a Treasure token.",
    },
  ],
});
