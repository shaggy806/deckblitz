import { defineCard } from "../define.js";

// EDHREC rank 8932. Spirit Mantle at +2/+2.
//
// Rulings:
//   [2013-01-24] The enchanted creature can't be blocked, it can't be targeted by abilities of
//     creatures or creature cards (like, notably, the scavenge ability), and all damage dealt to
//     it by creatures or creature cards is prevented.

const TEXT = "Enchanted creature gets +2/+2 and has protection from creatures.";

export default defineCard({
  name: "Holy Mantle",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      protection: { types: ["creature"] },
      text: TEXT,
    },
  ],
});
