import { defineCard } from "../define.js";

// EDHREC rank 9228.
// Makes Spirit → "Spirit Token (Great Arashin City)" (a plain 1/1 white Spirit).
//
// Rulings:
//   [2025-04-04] You choose whether to put +1/+1 counters on the creature or create a Spirit token
//     as the ability that includes the endure instruction is resolving.
//   [2025-04-04] If you can't put +1/+1 counters on the creature for any reason as an endure
//     ability resolves (for example, if the creature is no longer on the battlefield), you'll just
//     create a Spirit token.

const SPIRIT = { kind: "create-token", token: "Spirit Token (Great Arashin City)", count: 1 } as const;

export default defineCard({
  name: "Sinkhole Surveyor",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, you lose 1 life and this creature endures 1. (Put a +1/+1 counter on it or create a 1/1 white Spirit creature token.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1 },
          // Endure 1 (rule 701.63): fabricate's shape — the choice only while
          // it's still on the battlefield, otherwise just the Spirit.
          {
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
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, you lose 1 life and this creature endures 1.",
    },
  ],
});
