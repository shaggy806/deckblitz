import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 22161.
//
// Wooden Sphere's trigger, with a target chosen as it goes on the stack.

const TEXT = "Whenever a player casts a green spell, you may pay {3}. If you do, untap target permanent.";

export default defineCard({
  name: "Malachite Talisman",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["G"] } },
      targets: ["permanent"],
      effect: {
        kind: "may",
        prompt: "Pay {3} to untap the target permanent?",
        cost: "{3}",
        effect: { kind: "untap", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
