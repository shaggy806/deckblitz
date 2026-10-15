import { defineCard } from "../define.js";

// EDHREC rank 20849.
// Makes Spirit → "Spirit Token (Anafenza, Unyielding Lineage)" (a plain 2/2 white Spirit).
//
// Rulings:
//   [2025-04-04] You choose whether to put +1/+1 counters on the creature or create a Spirit token
//     as the ability that includes the endure instruction is resolving.
//   [2025-04-04] If you can't put +1/+1 counters on the creature for any reason as an endure
//     ability resolves (for example, if the creature is no longer on the battlefield), you'll just
//     create a Spirit token.

const SPIRIT = { kind: "create-token", token: "Spirit Token (Anafenza, Unyielding Lineage)", count: 1 } as const;
// Endure 2 (rule 701.63): the choice only while it's still on the
// battlefield, otherwise just the Spirit (Anafenza, Unyielding Lineage).
const ENDURE = {
  kind: "conditional",
  condition: { kind: "source-on-battlefield" },
  then: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Put two +1/+1 counters on this creature.",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      },
      { text: "Create a 2/2 white Spirit creature token.", effect: SPIRIT },
    ],
  },
  else: SPIRIT,
} as const;
const TRIGGER_TEXT = "Whenever this creature enters or attacks, it endures 2.";

export default defineCard({
  name: "Inspirited Vanguard",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: `${TRIGGER_TEXT} (Put two +1/+1 counters on it or create a 2/2 white Spirit creature token.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: ENDURE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: ENDURE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
