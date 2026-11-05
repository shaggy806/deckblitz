import { defineCard } from "../define.js";


export default defineCard({
  name: "Aeromoeba",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Beast"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nDiscard a card: Switch this creature's power and toughness until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
      resolve: null,
      text: "Discard a card: Switch this creature's power and toughness until end of turn.",
    },
  ],
});
