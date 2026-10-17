import { defineCard } from "../define.js";

// EDHREC rank 7431.
//
// Rulings:
//   [2023-10-13] Flatline affects only creatures your opponents control at the time it resolves.
//     Creatures they begin to control later in the turn won't change power and toughness.
//   [2023-10-13] Flatline overwrites any effects that set a creature's power and toughness. Any
//     existing effects or counters that raise, lower, or switch a creature's power and/or
//     toughness continue to apply to the creature's newly-set power and toughness.
//
// `animate-all` with no added types: a layer-7b base P/T set over the matches
// fixed as it resolves (both rulings).

export default defineCard({
  name: "Flatline",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Creatures your opponents control have base power and toughness 0/1 until end of turn.",
  effect: {
    kind: "animate-all",
    filter: { type: "creature", controlledBy: "opponent" },
    power: 0,
    toughness: 1,
    duration: "end-of-turn",
  },
});
