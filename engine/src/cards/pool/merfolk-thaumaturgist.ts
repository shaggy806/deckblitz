import { defineCard } from "../define.js";


export default defineCard({
  name: "Merfolk Thaumaturgist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{T}: Switch target creature's power and toughness until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "switch-pt", target: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Switch target creature's power and toughness until end of turn.",
    },
  ],
});
