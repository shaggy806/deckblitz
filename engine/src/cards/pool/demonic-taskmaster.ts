import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 9613. Lord of the Pit's sacrifice,
// without its fallback: with no other creature, nothing happens.
//
// Rulings:
//   [2012-05-01] If you control no other creatures, you won’t sacrifice anything.
//   [2012-05-01] If Demonic Taskmaster leaves the battlefield after its ability triggers but
//     before it resolves, you’ll still have to sacrifice a creature.
const UPKEEP = "At the beginning of your upkeep, sacrifice a creature other than this creature.";

export default defineCard({
  name: "Demonic Taskmaster",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exceptSource: true },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
