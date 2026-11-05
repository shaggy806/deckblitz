import { defineCard } from "../define.js";


export default defineCard({
  name: "Phantasmal Fiend",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 5,
  text: "{B}: This creature gets +1/-1 until end of turn.\n{1}{U}: Switch this creature's power and toughness until end of turn.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{B}: This creature gets +1/-1 until end of turn.",
    },
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{U}: Switch this creature's power and toughness until end of turn.",
    },
  ],
});
