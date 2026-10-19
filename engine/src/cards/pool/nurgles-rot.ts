import { defineCard } from "../define.js";

// EDHREC rank 8169.
//
// The trigger is the Aura's, reading its host as it last existed (rule
// 603.10a — Minion's Return's shape). By the time it resolves the Aura has
// gone to the graveyard as a state-based action (rule 704.5m), and rule 400.7f
// lets the ability find that card there: it's returned to its owner's hand
// from the graveyard, and only if it's still there. The Plaguebearer is yours
// (the Aura controller's) either way.
const RETURN_TEXT =
  "When enchanted creature dies, return this card to its owner's hand and you create a 1/3 black Demon creature token named Plaguebearer of Nurgle.";

export default defineCard({
  name: "Nurgle's Rot",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature an opponent controls\n${RETURN_TEXT}`,
  targets: ["creature-an-opponent-controls"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: "source", from: "graveyard" },
          { kind: "create-token", token: "Plaguebearer of Nurgle", count: 1 },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
