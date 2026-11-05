import { defineCard } from "../define.js";


export default defineCard({
  name: "Fluxcharger",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Weird"],
  power: 1,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever you cast an instant or sorcery spell, you may switch this creature's power and toughness until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Switch Fluxcharger's power and toughness until end of turn?",
        effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
      },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, you may switch this creature's power and toughness until end of turn.",
    },
  ],
});
