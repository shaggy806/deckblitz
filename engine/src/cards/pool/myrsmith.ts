import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast an artifact spell, you may pay {1}. If you do, create a 1/1 colorless Myr artifact creature token.";

// Digsite Engineer's shape: one payment, one Myr (the ruling).
export default defineCard({
  name: "Myrsmith",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a Myr token?",
        cost: "{1}",
        effect: { kind: "create-token", token: "Myr Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
