import { defineCard } from "../define.js";
// EDHREC rank 19409.
//
// Rulings:
//   This does not apply to life gain caused by combat damage from a creature with lifelink.
//
// Only a gain an effect brings to its own controller: lifelink's isn't a spell's or ability's
// (the ruling), nor is a cost's ("an opponent gains 3 life" — Invigorate), and a spell that gives
// another player life (Swords to Plowshares) isn't its controller's gain.
const TEXT = "If a spell or ability would cause its controller to gain life, that player loses that much life instead.";
export default defineCard({
  name: "Rain of Gore",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "any-player", becomesLoss: true, byOwnSpellOrAbility: true },
      text: TEXT,
    },
  ],
});
