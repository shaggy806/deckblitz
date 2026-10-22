import { curseWhenAttacked } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 12435.
//
// Rulings: it triggers once however many creatures attack the enchanted
// player, and not when only their planeswalker is attacked; with no creature
// attacking that player as it resolves, only you gain the life.

export default defineCard({
  name: "Curse of Vitality",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: "Enchant player\nWhenever enchanted player is attacked, you gain 2 life. Each opponent attacking that player does the same.",
  targets: ["player"],
  triggered: [
    curseWhenAttacked(
      { kind: "gain-life", amount: 2, who: "you-and-opponents-attacking-trigger-player" },
      "Whenever enchanted player is attacked, you gain 2 life. Each opponent attacking that player does the same.",
    ),
  ],
});
