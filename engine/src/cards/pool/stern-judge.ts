import { defineCard } from "../define.js";

// EDHREC rank 25354.

const ABILITY = "{T}: Each player loses 1 life for each Swamp they control.";

export default defineCard({
  name: "Stern Judge",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: ABILITY,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "lose-life",
        who: "each-player",
        amount: { countOf: { subtype: "Swamp", controlledBy: "you" }, forEachPlayer: true },
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
