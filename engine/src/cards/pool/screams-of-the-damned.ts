import { defineCard } from "../define.js";

// EDHREC rank 30469.

const ABILITY_TEXT =
  "{1}{B}, Exile a card from your graveyard: This enchantment deals 1 damage to each creature and each player.";

export default defineCard({
  name: "Screams of the Damned",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, exileFromGraveyard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
