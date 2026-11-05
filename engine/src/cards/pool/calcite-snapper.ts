import { defineCard } from "../define.js";


export default defineCard({
  name: "Calcite Snapper",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Turtle"],
  power: 1,
  toughness: 4,
  keywords: ["shroud"],
  text: "Shroud (This creature can't be the target of spells or abilities.)\nLandfall — Whenever a land you control enters, you may switch this creature's power and toughness until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Switch Calcite Snapper's power and toughness until end of turn?",
        effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, you may switch this creature's power and toughness until end of turn.",
    },
  ],
});
