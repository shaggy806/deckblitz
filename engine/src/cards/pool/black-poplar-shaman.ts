import { defineCard } from "../define.js";

export default defineCard({
  name: "Black Poplar Shaman",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Treefolk", "Shaman"],
  power: 1,
  toughness: 3,
  text: "{2}{B}: Regenerate target Treefolk.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { subtype: "Treefolk" } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{2}{B}: Regenerate target Treefolk.",
    },
  ],
});
