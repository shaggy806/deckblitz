import { defineCard } from "../define.js";

// EDHREC rank 12655.

export default defineCard({
  name: "Imperial Subduer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 2,
  text: "Whenever a Samurai or Warrior you control attacks alone, tap target creature you don't control.",
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { subtypes: ["Samurai", "Warrior"] } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Whenever a Samurai or Warrior you control attacks alone, tap target creature you don't control.",
    },
  ],
});
