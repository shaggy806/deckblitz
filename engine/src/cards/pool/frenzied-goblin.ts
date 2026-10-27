import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 9582.
//
// Maulfist Doorbuster's shape: the target is chosen as the trigger goes on
// the stack, the {R} is paid (or not) as it resolves. One target, one
// payment (the ruling).

const TEXT = "Whenever this creature attacks, you may pay {R}. If you do, target creature can't block this turn.";

export default defineCard({
  name: "Frenzied Goblin",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {R} to have target creature not block this turn?",
        cost: "{R}",
        effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
