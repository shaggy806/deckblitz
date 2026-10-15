import { defineCard } from "../define.js";

// EDHREC rank 16445.
//
// Rulings:
//   [2025-04-04] You choose whether to put +1/+1 counters on the creature or create a Spirit token
//     as the ability that includes the endure instruction is resolving.
//   [2025-04-04] If you can't put +1/+1 counters on the creature for any reason as an endure
//     ability resolves (for example, if the creature is no longer on the battlefield), you'll
//     just create a Spirit token.

const SPIRIT = { kind: "create-token", token: "Spirit Token (Great Arashin City)", count: 1 } as const;

export default defineCard({
  name: "Fortress Kin-Guard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog", "Soldier"],
  power: 1,
  toughness: 2,
  text: "When this creature enters, it endures 1. (Put a +1/+1 counter on it or create a 1/1 white Spirit creature token.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Endure 1 (rule 701.63): the choice only while it's still on the
      // battlefield, otherwise just the Spirit (Sinkhole Surveyor's shape).
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
      resolve: null,
      text: "When this creature enters, it endures 1.",
    },
  ],
});
