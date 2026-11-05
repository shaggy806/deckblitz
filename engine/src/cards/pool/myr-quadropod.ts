import { defineCard } from "../define.js";


export default defineCard({
  name: "Myr Quadropod",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 1,
  toughness: 4,
  text: "{3}: Switch this creature's power and toughness until end of turn.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
      resolve: null,
      text: "{3}: Switch this creature's power and toughness until end of turn.",
    },
  ],
});
