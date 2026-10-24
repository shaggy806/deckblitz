import { defineCard } from "../define.js";

// EDHREC rank 9588.
// Makes Human Soldier → "Human Soldier Token".
//
// Shalai, Voice of Plenty's shape: the player half is `playerHexproof`, the
// creature half a filter-scoped keyword grant.

const HEXPROOF_TEXT = "You and Humans you control have hexproof.";
const TOKEN_TEXT = "{2}, Exile a card from your graveyard: Create a 1/1 white Human Soldier creature token.";

export default defineCard({
  name: "Sigarda, Heron's Grace",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${HEXPROOF_TEXT}\n${TOKEN_TEXT}`,
  static: [
    { affects: { scope: "self" }, playerHexproof: true, text: HEXPROOF_TEXT },
    {
      affects: { scope: "filter", filter: { subtype: "Human", controlledBy: "you" } },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, exileFromGraveyard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
