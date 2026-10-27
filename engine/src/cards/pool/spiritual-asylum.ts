import { defineCard } from "../define.js";

// EDHREC rank 24196. One trigger per attacking creature; once the first has
// sacrificed it, the rest find nothing to sacrifice.

const SHROUD = "Creatures and lands you control have shroud. (They can't be the targets of spells or abilities.)";
const ATTACK = "When a creature you control attacks, sacrifice this enchantment.";

export default defineCard({
  name: "Spiritual Asylum",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${SHROUD}\n${ATTACK}`,
  static: [
    {
      affects: { scope: "filter", filter: { typesAnyOf: ["creature", "land"], controlledBy: "you" } },
      grantKeywords: ["shroud"],
      text: SHROUD,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: ATTACK,
    },
  ],
});
