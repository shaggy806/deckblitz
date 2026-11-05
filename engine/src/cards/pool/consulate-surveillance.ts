import { defineCard } from "../define.js";

const ENTER_TEXT = "When this enchantment enters, you get {E}{E}{E}{E} (four energy counters).";
const PREVENT_TEXT = "Pay {E}{E}: Prevent all damage that would be dealt to you this turn by a source of your choice.";

export default defineCard({
  name: "Consulate Surveillance",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${PREVENT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 4 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 2 },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "all" },
      resolve: null,
      text: PREVENT_TEXT,
    },
  ],
});
