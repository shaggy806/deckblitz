import { defineCard } from "../define.js";

// "Whenever you're dealt damage": once per simultaneous damage event, for
// the total, however many sources dealt it — a batched damage trigger on
// damage to you alone (once per player per event, and you are the only one).
const TEXT = "Whenever you're dealt damage, you may create that many 1/1 white Soldier creature tokens.";

export default defineCard({
  name: "Darien, King of Kjeldor",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create that many 1/1 white Soldier creature tokens?",
        effect: { kind: "create-token", token: "Soldier Token", count: { triggerValue: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
