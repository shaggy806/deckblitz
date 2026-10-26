import { defineCard } from "../define.js";

// EDHREC rank 29756. The target is chosen as the trigger goes on the stack;
// the {1} is asked as it resolves (Knowledge and Power's shape).

const TEXT =
  "Whenever you cast an artifact spell, you may pay {1}. If you do, this creature deals 1 damage to any target.";

export default defineCard({
  name: "Embersmith",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Pay {1} to have Embersmith deal 1 damage?",
        cost: "{1}",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
