import { defineCard } from "../define.js";

const TEXT =
  "Whenever a player discards a card, you may pay {1}{U}. If you do, you may tap or untap target permanent.";

// "If you do" (not "when you do"): the permanent is targeted as the trigger
// goes on the stack, once per card discarded (`perCard`); paying, you may then
// tap it, untap it, or neither.
export default defineCard({
  name: "Telekinetic Bonds",
  manaCost: "{2}{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "any", perCard: true },
      targets: ["permanent"],
      effect: {
        kind: "may",
        prompt: "Pay {1}{U} to tap or untap target permanent?",
        cost: "{1}{U}",
        effect: {
          kind: "modal",
          minModes: 0,
          maxModes: 1,
          modes: [
            { effect: { kind: "tap", target: 0 }, text: "Tap target permanent." },
            { effect: { kind: "untap", target: 0 }, text: "Untap target permanent." },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
