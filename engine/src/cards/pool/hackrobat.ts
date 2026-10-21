import { defineCard } from "../define.js";

// EDHREC rank 25868.

export default defineCard({
  name: "Hackrobat",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  alternativeCost: {
    mana: "{B}{R}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: "Spectacle {B}{R} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)\n{B}: This creature gains deathtouch until end of turn.\n{R}: This creature gets +2/-2 until end of turn.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "deathtouch",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{B}: This creature gains deathtouch until end of turn.",
    },
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +2/-2 until end of turn.",
    },
  ],
});
