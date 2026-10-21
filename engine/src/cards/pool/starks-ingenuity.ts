import { defineCard } from "../define.js";

// EDHREC rank 16045.
//
// Elenda and Azor's shape for the {X} draw; the draw trigger is the Aura's
// own ("you" is its controller), its counter going on what it enchants.

const ENTERS = "When this Aura enters, you may pay {X}. If you do, draw X cards.";
const DRAWS = "Whenever you draw a card, put a +1/+1 counter on enchanted creature.";

export default defineCard({
  name: "Stark's Ingenuity",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${ENTERS}\n${DRAWS}`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to draw X cards?",
        cost: "{X}",
        effect: { kind: "draw", amount: "x" },
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAWS,
    },
  ],
});
