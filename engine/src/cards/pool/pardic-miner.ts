import { defineCard } from "../define.js";

// EDHREC rank 24677.
//
// Usable at instant speed, so in response to nothing at all on an opponent's
// upkeep it keeps them from playing a land that turn (rule 305.2), from any
// zone. A land they already played stays.
const SAC_TEXT = "Sacrifice this creature: Target player can't play lands this turn.";

export default defineCard({
  name: "Pardic Miner",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  text: SAC_TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "prohibit", prohibits: [{ act: "play-land", who: { target: 0 } }] },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
