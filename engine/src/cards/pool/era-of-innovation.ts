import { defineCard } from "../define.js";

// An artifact Artificer is one permanent entering, so one trigger (the
// ruling); the {1} is paid once at most as it resolves.
const TRIGGER_TEXT =
  "Whenever an artifact or Artificer you control enters, you may pay {1}. If you do, you get {E}{E} (two energy counters).";
const DRAW_TEXT = "Pay six {E}, Sacrifice this enchantment: Draw three cards.";

export default defineCard({
  name: "Era of Innovation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { anyOf: [{ type: "artifact" }, { subtype: "Artificer" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to get {E}{E}?",
        cost: "{1}",
        effect: { kind: "get-energy", amount: 2 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 6, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
