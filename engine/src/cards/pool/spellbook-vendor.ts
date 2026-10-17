import { defineCard } from "../define.js";

// Go-Shintai's shape: {1} paid as it resolves, then a reflexive trigger
// (rule 603.12) that chooses its target.
const VENDOR_TEXT =
  "At the beginning of combat on your turn, you may pay {1}. When you do, create a Sorcerer Role token attached to target creature you control.";

export default defineCard({
  name: "Spellbook Vendor",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${VENDOR_TEXT} (If you control another Role on it, put that one into the graveyard. Enchanted creature gets +1/+1 and has "Whenever this creature attacks, scry 1.")`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a Sorcerer Role token?",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature-you-control"],
          effect: { kind: "create-token", token: "Sorcerer Role Token", count: 1, attachedTo: 0 },
          text: "When you do, create a Sorcerer Role token attached to target creature you control.",
        },
      },
      resolve: null,
      text: VENDOR_TEXT,
    },
  ],
});
