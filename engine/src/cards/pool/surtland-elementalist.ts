import { defineCard } from "../define.js";

// EDHREC rank 17561.
const ATTACK_TEXT =
  "Whenever this creature attacks, you may cast an instant or sorcery spell from your hand without paying its mana cost.";

export default defineCard({
  name: "Surtland Elementalist",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Giant", "Wizard"],
  power: 8,
  toughness: 8,
  text: `As an additional cost to cast this spell, reveal a Giant card from your hand or pay {2}.\n${ATTACK_TEXT}`,
  additionalCost: {
    options: [
      { text: "Reveal a Giant card from your hand", behold: { filter: { subtype: "Giant" }, text: "a Giant card", fromHand: true } },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "cast-now", from: "hand", free: true, spell: { typesAnyOf: ["instant", "sorcery"] } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
