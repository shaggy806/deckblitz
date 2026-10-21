import { defineCard } from "../define.js";

// EDHREC rank 28756.

export default defineCard({
  name: "Spikewheel Acrobat",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 5,
  toughness: 2,
  alternativeCost: {
    mana: "{2}{R}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: "Spectacle {2}{R} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)",
});
