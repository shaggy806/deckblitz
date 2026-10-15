import { defineCard } from "../define.js";

// EDHREC rank 28791.

export default defineCard({
  name: "Living Library",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Book", "Illusion"],
  power: 0,
  toughness: 4,
  text: "{6}, Sacrifice this creature: Choose target creature or planeswalker an opponent controls. Its owner shuffles it into their library.",
  activated: [
    {
      cost: { mana: "{6}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "shuffle-into-library", target: 0 },
      resolve: null,
      text: "{6}, Sacrifice this creature: Choose target creature or planeswalker an opponent controls. Its owner shuffles it into their library.",
    },
  ],
});
