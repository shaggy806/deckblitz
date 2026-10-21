import { defineCard } from "../define.js";

// EDHREC rank 22184.
//
// Rulings:
//   [2019-10-04] Witch's Vengeance affects only creatures of the chosen type that are on the
//     battlefield at the time it resolves. This includes creatures you control, creatures with
//     hexproof, and creatures with protection from black.
//   [2019-10-04] You choose a creature type as Witch's Vengeance resolves, not as you cast it.

export default defineCard({
  name: "Witch's Vengeance",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Creatures of the creature type of your choice get -3/-3 until end of turn.",
  targets: [],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "modify-pt-all",
      filter: { type: "creature", subtype: "$chosen" },
      power: -3,
      toughness: -3,
      duration: "end-of-turn",
    },
  },
});
