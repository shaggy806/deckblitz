import { defineCard } from "../define.js";

// EDHREC rank 13880.

export default defineCard({
  name: "Asari Captain",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 4,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\nWhenever a Samurai or Warrior you control attacks alone, it gets +1/+0 until end of turn for each Samurai or Warrior you control.",
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { subtypes: ["Samurai", "Warrior"] } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: { countOf: { type: "creature", controlledBy: "you", subtypes: ["Samurai", "Warrior"] } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever a Samurai or Warrior you control attacks alone, it gets +1/+0 until end of turn for each Samurai or Warrior you control.",
    },
  ],
});
