import { defineCard } from "../define.js";

// EDHREC rank 14020. Marvel Super Heroes Commander.
//
// "That much mana of any one color": `any-color` with an amount is one
// colour for all of it, asked as the trigger resolves (rule 608.2d). The
// mana persists through the turn's steps and phases (`persists`, Savage
// Ventmaw) and is emptied at cleanup — "until end of turn".
const DAMAGE_TEXT =
  "Whenever Photon deals combat damage to a player, add that much mana of any one color. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Photon, Mighty Marvel",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: { triggerValue: true }, persists: true },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
