import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature becomes tapped, you may create a 1/1 blue Merfolk Wizard creature token.";

export default defineCard({
  name: "Stonybrook Schoolmaster",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 2,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 blue Merfolk Wizard creature token?",
        effect: { kind: "create-token", token: "Merfolk Wizard Token", count: 1 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
