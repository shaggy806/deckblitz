import { defineCard } from "../define.js";

// EDHREC rank 21541.
//
// Powers are compared only as blockers are declared (the rulings).

const EVASION = "Creatures with power less than this creature's power can't block it.";

export default defineCard({
  name: "Shrill Howler",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf", "Horror"],
  power: 3,
  toughness: 1,
  text: `${EVASION}\n{5}{G}: Transform this creature.`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
      text: EVASION,
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
