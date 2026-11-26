import { defineCard } from "../define.js";

// The card exiled decides the cost's mana (rule 601.2f via 602.2b), so it's
// named as the ability is activated (`exileFromGraveyard.payItsManaCost`):
// one offer per creature card with a mana cost, {X} in it as 0 (107.3h).
// The token copies the card as it was exiled (`{ paid: "exiled" }`).

const TEXT =
  "Exile a creature card from your graveyard and pay its mana cost: Create a token that's a copy of that card. Activate only as a sorcery.";

export default defineCard({
  name: "Back from the Brink",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        exileFromGraveyard: { count: 1, filter: { type: "creature" }, payItsManaCost: true },
      },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "create-token-copy", of: { paid: "exiled" }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
