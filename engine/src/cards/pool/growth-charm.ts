import { defineCard } from "../define.js";

// A playtest card (Mystery Booster). Each mode is a card name standing for
// that card's text (the rulings): Rampant Growth, Giant Growth, Regrowth.

export default defineCard({
  name: "Growth Charm",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Rampant Growth\n• Giant Growth\n• Regrowth",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Rampant Growth",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
      {
        text: "Giant Growth",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      },
      {
        text: "Regrowth",
        targets: [{ kind: "card-in-graveyard", whose: "you" }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
    ],
  },
});
