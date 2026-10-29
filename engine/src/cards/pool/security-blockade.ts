import { defineCard } from "../define.js";

// EDHREC rank 28812.
// Makes Knight → uses "Knight Token".
//
// The granted ability's "you" is whoever activates it (the land's
// controller): a shield of the next 1 damage to that player this turn.

const GRANTED_TEXT = "{T}: Prevent the next 1 damage that would be dealt to you this turn.";
const GRANT_TEXT = `Enchanted land has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Security Blockade",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\nWhen this Aura enters, create a 2/2 white Knight creature token with vigilance.\n${GRANT_TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token", count: 1 },
      resolve: null,
      text: "When this Aura enters, create a 2/2 white Knight creature token with vigilance.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "damage-rule", to: { players: "you" }, amount: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
