import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 27354.
//
// Rulings:
//   [2006-07-15] Kjeldoran Gargoyle's triggered ability triggers when it deals any damage, not
//     only combat damage.
//   [2006-07-15] Unlike lifelink, the last ability is a triggered ability that goes on the stack.

const TEXT = "Whenever this creature deals damage, you gain that much life.";

export default defineCard({
  name: "Kjeldoran Gargoyle",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Gargoyle"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "first-strike"],
  text: `Flying, first strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
