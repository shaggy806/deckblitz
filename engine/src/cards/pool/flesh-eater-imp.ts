import { defineCard } from "../define.js";

export default defineCard({
  name: "Flesh-Eater Imp",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Imp"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "infect"],
  text: "Flying\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nSacrifice a creature: This creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Sacrifice a creature: This creature gets +1/+1 until end of turn.",
    },
  ],
});
