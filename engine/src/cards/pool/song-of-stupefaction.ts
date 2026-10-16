import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan.
//
// "Enchant creature or Vehicle" is the Aura's target (Spin Out's filter),
// checked again by the state-based actions. Fathomless descent is a live
// count (the ruling: X changes as the graveyard does) — a `grantPtPerCount`
// over permanent cards in its controller's graveyard, -1/-0 each. "You may
// mill two cards" isn't offered with fewer than two cards in the library
// (the ruling; the `may`'s own check).

const DESCENT =
  "Fathomless descent — Enchanted permanent gets -X/-0, where X is the number of permanent cards in your graveyard.";

export default defineCard({
  name: "Song of Stupefaction",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature or Vehicle\nWhen this Aura enters, you may mill two cards. (You may put the top two cards of your library into your graveyard.)\n${DESCENT}`,
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Mill two cards?",
        effect: { kind: "mill", target: "you", amount: 2 },
      },
      resolve: null,
      text: "When this Aura enters, you may mill two cards.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        inGraveyard: {
          typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
          ownedBy: "you",
        },
        pt: [-1, 0],
      },
      text: DESCENT,
    },
  ],
});
