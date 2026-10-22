import { defineCard } from "../define.js";

// EDHREC rank 25962. The target is chosen as the trigger goes on the stack;
// the {3} is offered as it resolves.
export default defineCard({
  name: "Lapis Lazuli Talisman",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "Whenever a player casts a blue spell, you may pay {3}. If you do, untap target permanent.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["U"] } },
      targets: ["permanent"],
      effect: {
        kind: "may",
        prompt: "Pay {3} to untap the target permanent?",
        cost: "{3}",
        effect: { kind: "untap", target: 0 },
      },
      resolve: null,
      text: "Whenever a player casts a blue spell, you may pay {3}. If you do, untap target permanent.",
    },
  ],
});
