import { defineCard } from "../define.js";

const SAGE_TEXT = "When this creature enters, you may pay {2}. If you do, create a Sorcerer Role token attached to it.";

export default defineCard({
  name: "Unassuming Sage",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Peasant", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${SAGE_TEXT} (Enchanted creature gets +1/+1 and has "Whenever this creature attacks, scry 1.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to create a Sorcerer Role token attached to it?",
        cost: "{2}",
        effect: { kind: "create-token", token: "Sorcerer Role Token", count: 1, attachedTo: "source" },
      },
      resolve: null,
      text: SAGE_TEXT,
    },
  ],
});
