import { defineCard } from "../define.js";

const TEXT = "Whenever enchanted land is tapped for mana, its controller adds an additional two mana in any combination of colors.";

// A triggered mana ability (rule 605.1b): each of the two is its own pick, with
// the land's when it's tapped by hand, and whatever the cost wants when the
// auto-payer taps it (`Game.tappedForManaExtras`).
export default defineCard({
  name: "Market Festival",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "attached" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
