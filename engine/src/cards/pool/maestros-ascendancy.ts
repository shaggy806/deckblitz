import { defineCard } from "../define.js";

// Kess, Dissident Mage's permission with a creature sacrificed beside the
// spell's other costs (rule 601.2f). Beside a sacrifice the spell names of its
// own (Fling), both are paid: Fling's named on the cast, this one chosen as
// it's paid (`Game.namesOwnSacrifice`), and Fling's "the sacrificed creature"
// is its own.
export default defineCard({
  name: "Maestros Ascendancy",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["enchantment"],
  text:
    "Once during each of your turns, you may cast an instant or sorcery spell from your graveyard by " +
    "sacrificing a creature in addition to paying its other costs. If a spell cast this way would be put " +
    "into your graveyard, exile it instead.",
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        // An instant or sorcery *spell*, judged as the face cast (601.3e):
        // an Adventure creature card's sorcery half too, which then goes on
        // its adventure as it resolves (the 2022-04-29 ruling, 715.3d).
        spell: { typesAnyOf: ["instant", "sorcery"] },
        oncePerTurn: true,
        yourTurnOnly: true,
        sacrifice: { type: "creature" },
        exileAfter: true,
      },
      text:
        "Once during each of your turns, you may cast an instant or sorcery spell from your graveyard by " +
        "sacrificing a creature in addition to paying its other costs. If a spell cast this way would be put " +
        "into your graveyard, exile it instead.",
    },
  ],
});
