import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 17031.
//
// Rulings:
//   [2024-04-12] A card, spell, or permanent is an outlaw if it has the Assassin, Mercenary,
//     Pirate, Rogue, or Warlock creature type. It doesn’t matter if it has more than one of those
//     creature types; as long as it has at least one, it’s an outlaw.
//   [2024-04-12] Outlaw is not a creature type. If an effect asks you to choose a creature type,
//     you can’t choose outlaw.
//   [2024-04-12] If an ability refers to an outlaw or whether a player controls an outlaw, it’s
//     referring only to permanents with one or more of the creature types specified above.
//     Notably, it’s not referring to any spell or card not on the battlefield. However, other
//     abilities may refer to an “outlaw spell” or “outlaw card” in a zone other than the
//     battlefield. Those abilities refer to spells and cards with one or more of the specified
//     creature types.

// Affinity for outlaws (rule 702.41a): {1} less for each permanent you
// control with at least one of the five outlaw creature types.
const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];

export default defineCard({
  name: "Hellspur Brute",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Mercenary"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: "Affinity for outlaws (This spell costs {1} less to cast for each Assassin, Mercenary, Pirate, Rogue, and/or Warlock you control.)\nTrample",
  selfCostReduction: affinity({ subtypes: OUTLAWS }),
});
