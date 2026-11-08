import { defineCard } from "../define.js";

// A damage replacement whose recipient is the player this Aura enchants (rule 614.1a).

const TEXT = "If a source would deal damage to enchanted player, it deals double that damage to that player instead.";

export default defineCard({
  name: "Curse of Bloodletting",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", instead: { modify: { times: 2 } }, to: "enchanted-player" },
      text: TEXT,
    },
  ],
});
