import { defineCard } from "../define.js";

// EDHREC rank 13528.
//
// Rulings:
//   Sources that have no creature type at all are non-Human sources, as are sources with
//   creature types that don't include Human. A creature that is Human and has other types,
//   such as a Human Werewolf, is still a Human source.
export default defineCard({
  name: "Repel the Abominable",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt this turn by non-Human sources.",
  targets: [],
  effect: { kind: "damage-rule", by: { filter: { notSubtypes: ["Human"] } } },
});
