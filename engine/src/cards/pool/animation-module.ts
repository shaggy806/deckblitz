import { defineCard } from "../define.js";

// EDHREC rank 4411. The first ability triggers once for each permanent you
// control that +1/+1 counters are put on, one entering with them included
// (the rulings); the {1} is paid once as it resolves. The second chooses,
// as it resolves, a kind of counter the target permanent or player has and
// gives it one more — a player's poison, energy, experience and the rest;
// with no counter there, nothing happens.
//
// Rulings:
//   - Abilities that trigger when counters are put on a permanent trigger when a permanent enters
//     the battlefield with counters and when a player puts counters on a permanent.
//   - You can pay {1} only once each time Animation Module's first ability resolves. You can't pay
//     more to create extra Servo tokens.
//   - If +1/+1 counters are put on more than one permanent you control at the same time, Animation
//     Module's first ability triggers once for each of those permanents.

const SERVO_TEXT =
  "Whenever one or more +1/+1 counters are put on a permanent you control, you may pay {1}. If you do, create a 1/1 colorless Servo artifact creature token.";
const COUNTER_TEXT =
  "{3}, {T}: Choose a counter on target permanent or player. Give that permanent or player another counter of that kind.";

export default defineCard({
  name: "Animation Module",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${SERVO_TEXT}\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "you-control", counter: "+1/+1" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a 1/1 Servo?",
        cost: "{1}",
        effect: { kind: "create-token", token: "Servo Token", count: 1 },
      },
      resolve: null,
      text: SERVO_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["permanent-or-player"],
      effect: {
        kind: "choose-value",
        value: "counter-kind",
        on: 0,
        then: { kind: "add-counter", target: 0, counter: "$chosenCounter", amount: 1 },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
