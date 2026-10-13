import { defineCard } from "../define.js";

// EDHREC rank 7025.
//
// Rulings:
//   [2024-02-02] If Buried in the Garden leaves the battlefield before its first triggered ability
//     resolves, the target permanent won't be exiled.
//   [2024-02-02] Auras attached to the exiled permanent will be put into their owners' graveyards.
//     Any Equipment will become unattached and remain on the battlefield. Any counters on the
//     exiled permanent will cease to exist. When the card returns to the battlefield, it will be a
//     new object with no connection to the card that was exiled.
//   [2024-02-02] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.

const EXILE =
  "When this Aura enters, exile target nonland permanent you don't control until this Aura leaves the battlefield.";
const MANA = "Whenever enchanted land is tapped for mana, its controller adds an additional one mana of any color.";

export default defineCard({
  name: "Buried in the Garden",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${EXILE}\n${MANA}`,
  targets: ["land"],
  triggered: [
    // Chains of Custody's O-Ring trigger: gone before it resolves, nothing is
    // exiled (the first ruling).
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE,
    },
    // Its linked half (rule 610.3): the card comes back as the Aura leaves.
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this Aura leaves the battlefield, return the exiled card.",
    },
    // Fertile Ground's trigger.
    {
      trigger: { on: "tapped-for-mana", who: "attached" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA,
    },
  ],
});
