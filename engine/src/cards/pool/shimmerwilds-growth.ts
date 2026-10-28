import { defineCard } from "../define.js";

// EDHREC rank 7911.
//
// Heraldic Banner's choice (`chooseOnEnter`), the colour set in layer 5 on the land
// (`setsChosenColor`), and Blighted Burgeoning's mana trigger reading this Aura's
// chosen colour (`add-mana`'s "chosen").
//
// Rulings:
//   [2025-11-17] Shimmerwilds Growth's last ability is a mana ability. It doesn't use the stack
//     and can't be responded to.

const MANA_TEXT = "Whenever enchanted land is tapped for mana, its controller adds an additional one mana of the chosen color.";

export default defineCard({
  name: "Shimmerwilds Growth",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\nAs this Aura enters, choose a color.\nEnchanted land is the chosen color.\n${MANA_TEXT}`,
  targets: ["land"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "attached" },
      setsChosenColor: true,
      text: "Enchanted land is the chosen color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "attached" },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
