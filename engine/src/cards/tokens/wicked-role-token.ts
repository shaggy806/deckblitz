import { defineCard } from "../define.js";

const DRAIN_TEXT = "When this token is put into a graveyard from the battlefield, each opponent loses 1 life.";

// Rule 111.10q: a colorless Aura Role enchantment token named Wicked. A token
// does go to the graveyard before it ceases to exist (rule 111.7), so this
// triggers — including when a newer Role of its controller's replaces it.
export default defineCard({
  name: "Wicked Role Token",
  art: "https://cards.scryfall.io/art_crop/front/a/9/a9b7040e-cd24-42cc-b043-9af8c557da6a.jpg",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Aura", "Role"],
  text: `Enchant creature\nEnchanted creature gets +1/+1.\n${DRAIN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      text: "Enchanted creature gets +1/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
