import { defineCard } from "../define.js";

// Ice Age talisman: Ivory Cup's "you may pay; if you do", with a target
// chosen as the trigger goes on the stack.

const TEXT = "Whenever a player casts a white spell, you may pay {3}. If you do, untap target permanent.";

export default defineCard({
  name: "Nacre Talisman",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["W"] } },
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
