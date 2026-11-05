import { defineCard } from "../define.js";


export default defineCard({
  name: "Valakut Fireboar",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Boar"],
  power: 1,
  toughness: 7,
  text: "Whenever this creature attacks, switch its power and toughness until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, switch its power and toughness until end of turn.",
    },
  ],
});
