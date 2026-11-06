import { defineCard } from "../define.js";


export default defineCard({
  name: "Reclamation Specialist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 2,
  text: "{1}, Sacrifice an artifact creature: Draw a card.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { types: ["artifact", "creature"] } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}, Sacrifice an artifact creature: Draw a card.",
    },
  ],
});
