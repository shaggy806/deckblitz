import { defineCard } from "../define.js";

const HERO_TEXT = "Whenever this creature attacks, if its toughness is 3 or less, put a +1/+1 counter on it.";

// Rule 111.10r: a colorless Aura Role enchantment token named Young Hero.
// The "if" is an intervening if (rule 603.4): read as it triggers and again
// as it resolves.
export default defineCard({
  name: "Young Hero Role Token",
  art: "https://cards.scryfall.io/art_crop/back/c/f/cff8ef48-2988-4d21-837e-01f1459e07c5.jpg",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Aura", "Role"],
  text: `Enchant creature\nEnchanted creature has "${HERO_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          condition: { kind: "source", filter: { toughness: { op: "lte", n: 3 } } },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          resolve: null,
          text: HERO_TEXT,
        },
      ],
      text: `Enchanted creature has "${HERO_TEXT}"`,
    },
  ],
});
