import { defineCard } from "../define.js";

export default defineCard({
  name: "Duergar Mine-Captain",
  manaCost: "{2}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Soldier"],
  power: 2,
  toughness: 1,
  text: "{1}{R/W}, {Q}: Attacking creatures get +1/+0 until end of turn. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{1}{R/W}", tap: false, untap: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}{R/W}, {Q}: Attacking creatures get +1/+0 until end of turn.",
    },
  ],
});
