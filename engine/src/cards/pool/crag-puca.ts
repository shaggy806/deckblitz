import { defineCard } from "../define.js";


export default defineCard({
  name: "Crag Puca",
  manaCost: "{U/R}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 4,
  text: "{U/R}: Switch this creature's power and toughness until end of turn.",
  activated: [
    {
      cost: { mana: "{U/R}", tap: false },
      targets: [],
      effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
      resolve: null,
      text: "{U/R}: Switch this creature's power and toughness until end of turn.",
    },
  ],
});
