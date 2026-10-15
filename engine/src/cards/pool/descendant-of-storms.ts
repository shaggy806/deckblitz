import { defineCard } from "../define.js";

// EDHREC rank 18023.
// Makes Spirit → "Spirit Token (Great Arashin City)" (a plain 1/1 white Spirit).
//
// Rulings:
//   [2025-04-04] You can't pay the cost for the triggered ability more than once each time it
//     triggers.
//   [2025-04-04] You choose whether to put +1/+1 counters on the creature or create a Spirit token
//     as the ability that includes the endure instruction is resolving.
//   [2025-04-04] If you can't put +1/+1 counters on the creature for any reason as an endure
//     ability resolves (for example, if the creature is no longer on the battlefield), you'll just
//     create a Spirit token.

const SPIRIT = { kind: "create-token", token: "Spirit Token (Great Arashin City)", count: 1 } as const;
const ATTACK_TEXT = "Whenever this creature attacks, you may pay {1}{W}. If you do, it endures 1.";

export default defineCard({
  name: "Descendant of Storms",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature attacks, you may pay {1}{W}. If you do, it endures 1. (Put a +1/+1 counter on it or create a 1/1 white Spirit creature token.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{W} to have this creature endure 1?",
        cost: "{1}{W}",
        // Endure 1 (rule 701.63): the choice only while it's still on the
        // battlefield, otherwise just the Spirit.
        effect: {
          kind: "conditional",
          condition: { kind: "source-on-battlefield" },
          then: {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              {
                text: "Put a +1/+1 counter on this creature.",
                effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
              },
              { text: "Create a 1/1 white Spirit creature token.", effect: SPIRIT },
            ],
          },
          else: SPIRIT,
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
