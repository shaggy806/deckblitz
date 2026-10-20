import { defineCard } from "../define.js";

// Rulings:
//   [2025-01-24] If an effect refers to a Blood token, it means any artifact token with the
//     subtype Blood, even if it has gained other subtypes.
//   [2025-01-24] You can't sacrifice a Blood token to pay multiple costs.

const CANT_BLOCK_TEXT = "This creature can't block.";
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, create a Blood token.";
const RETURN_TEXT = "{B}, Sacrifice two Blood tokens: Return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Falkenrath Forebear",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${CANT_BLOCK_TEXT}\n${DAMAGE_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: CANT_BLOCK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{B}",
        tap: false,
        sacrifice: { filter: { type: "artifact", subtype: "Blood", token: true }, count: 2 },
      },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
