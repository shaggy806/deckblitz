import { defineCard } from "../define.js";

// EDHREC rank 21541.
//
// Rulings:
//   [2016-07-13] The power of the blocking creature and that of Shrill Howler are compared only at
//     the moment that blockers are chosen. Changing either creature's power later won't cause
//     Shrill Howler to become unblocked.
//
// Den Protector's evasion; the back face is Howling Chorus.
const EVASION_TEXT = "Creatures with power less than this creature's power can't block it.";

export default defineCard({
  name: "Shrill Howler",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf", "Horror"],
  power: 3,
  toughness: 1,
  text: `${EVASION_TEXT}\n{5}{G}: Transform this creature.`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
      text: EVASION_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{5}{G}: Transform this creature.",
    },
  ],
  faces: ["Shrill Howler", "Howling Chorus"],
  transform: true,
});
