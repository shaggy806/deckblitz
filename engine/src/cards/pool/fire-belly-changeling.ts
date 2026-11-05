import { defineCard } from "../define.js";

// EDHREC rank 12898.

export default defineCard({
  name: "Fire-Belly Changeling",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 1,
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\n{R}: This creature gets +1/+0 until end of turn. Activate no more than twice each turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn. Activate no more than twice each turn.",
      timesEachTurn: 2,
    },
  ],
});
