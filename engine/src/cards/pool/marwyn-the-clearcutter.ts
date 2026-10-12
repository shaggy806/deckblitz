import { defineCard } from "../define.js";

export default defineCard({
  name: "Marwyn, the Clearcutter",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 1,
  text: "{2}, {T}, Sacrifice an artifact or land: Draw a card.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { typesAnyOf: ["artifact", "land"] } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, {T}, Sacrifice an artifact or land: Draw a card.",
    },
  ],
});
