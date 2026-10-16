import { defineCard } from "../define.js";

// EDHREC rank 20533.
//
// Rulings:
//   [2024-07-05] You don't choose a target for Labyrinth Adversary's last ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you pay {1}{R} this way. You
//     choose a target for that ability as it goes on the stack. Each player may respond to this
//     triggered ability as normal.
//
// - Invisible Woman's "whenever you attack, you may pay …. When you do"
//   shape, with Ty Lee's can't-block reflexive ability.

const ATTACK = "Whenever you attack, you may pay {1}{R}. When you do, target creature can't block this turn.";

export default defineCard({
  name: "Labyrinth Adversary",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player it's attacking.)\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{R} to have target creature not block this turn?",
        cost: "{1}{R}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          text: "When you do, target creature can't block this turn.",
        },
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
