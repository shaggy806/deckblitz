import { defineCard } from "../define.js";

// Rulings:
//   The -2/-2 and loss of Flying both last until end of turn. The -2/-2 is not permanent.
//
// The pump goes first: both steps read "attacking creatures with flying" as
// the spell resolves, and the second would match nothing once flying is gone.

export default defineCard({
  name: "Wind Shear",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Attacking creatures with flying get -2/-2 and lose flying until end of turn.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true, keyword: "flying" },
        power: -2,
        toughness: -2,
        duration: "end-of-turn",
      },
      {
        kind: "lose-keywords",
        filter: { type: "creature", attacking: true, keyword: "flying" },
        keywords: ["flying"],
        duration: "end-of-turn",
      },
    ],
  },
});
