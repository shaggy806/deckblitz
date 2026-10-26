import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 19033.
//
// Rulings:
//   [2008-04-01] You choose a target for this spell as you cast it, but you don't choose a
//     creature type until the spell resolves.
//   [2008-04-01] Spells and abilities that prevent damage or regenerate the targeted creature must
//     be cast or activated before the creature type is chosen.
//   [2008-04-01] Note that this spell counts the number of permanents you control of the chosen
//     type, not just the number of creatures you control. It will also take your kindred
//     permanents of the chosen type into account.

export default defineCard({
  name: "Coordinated Barrage",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose a creature type. Coordinated Barrage deals damage to target attacking or blocking creature equal to the number of permanents you control of the chosen type.",
  targets: ["attacking-or-blocking-creature"],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "damage",
      target: 0,
      // Permanents, not creatures: kindred permanents of the type count too.
      amount: { countOf: { controlledBy: "you", subtype: CHOSEN_CREATURE_TYPE } },
    },
  },
});
