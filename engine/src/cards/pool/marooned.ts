import { defineCard } from "../define.js";

// EDHREC rank 31237.

const ENTER_TEXT = "When this Aura enters, you may pay {3}. If you do, tap enchanted permanent.";
const STATIC_TEXT = "Enchanted permanent doesn't untap during its controller's untap step and can't be beamed up.";

// "Can't be beamed up": it can't be the creature returned for a beam me up
// cost (a `be-beamed-up` prohibition on the enchanted permanent).
export default defineCard({
  name: "Marooned",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${ENTER_TEXT}\n${STATIC_TEXT}`,
  targets: ["artifact-or-creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {3} to tap enchanted permanent?",
        cost: "{3}",
        effect: { kind: "tap", target: "attached" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    { affects: { scope: "attached" }, restrictions: ["doesnt-untap"], text: STATIC_TEXT },
    { affects: { scope: "self" }, prohibits: [{ act: "be-beamed-up", object: { hostOfSource: true } }], text: STATIC_TEXT },
  ],
});
