import { defineCard } from "../define.js";

// EDHREC rank 12704.
//
// Rulings:
//   [2023-10-13] You must still follow any relevant timing rules for the non-Adventure spell you
//     cast from exile. Normally, you'll be able to cast it only during your main phase while the
//     stack is empty.
//   [2023-10-13] If you cast an adventurer card as an Adventure, use only its alternative
//     characteristics to determine whether it's legal to cast that spell.
//
// An adventurer whose main half is a sorcery: cast from the hand or, after
// Unlikely Meeting, from exile (rule 715.3), either way only with two or more
// Doctors (Karn's Temporal Sundering's `castOnlyIf`, which the Adventure half
// doesn't have). "Exile Twice Upon a Time" is `exileOnResolve`: a countered
// or fizzled one goes to the graveyard.
export default defineCard({
  name: "Twice Upon a Time",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Cast this spell only if you control two or more Doctors.\nTake an extra turn after this one. Exile Twice Upon a Time.",
  castOnlyIf: { kind: "controls", filter: { subtype: "Doctor" }, atLeast: 2 },
  exileOnResolve: true,
  effect: { kind: "take-extra-turn" },
  faces: ["Twice Upon a Time", "Unlikely Meeting"],
  adventure: true,
});
