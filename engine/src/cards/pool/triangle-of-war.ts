import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 23635.
//
// Rulings:
//   [2004-10-04] If either target is illegal when the ability resolves, it will do nothing.
//
// Brigid's Command's fight, which does nothing unless both targets are still
// legal (rule 701.12b).
const TEXT =
  "{2}, Sacrifice this artifact: Target creature you control fights target creature an opponent controls.";

export default defineCard({
  name: "Triangle of War",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (Each deals damage equal to its power to the other.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: ["creature-you-control", "creature-an-opponent-controls"],
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
