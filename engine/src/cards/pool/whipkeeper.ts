import { defineCard } from "../define.js";

export default defineCard({
  name: "Whipkeeper",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  text: "{T}: This creature deals damage to target creature equal to the damage already dealt to it this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "damage",
        amount: { damageDealtThisTurn: true, who: "each-player", to: { target: 0 } },
        target: 0,
      },
      resolve: null,
      text: "{T}: This creature deals damage to target creature equal to the damage already dealt to it this turn.",
    },
  ],
});
