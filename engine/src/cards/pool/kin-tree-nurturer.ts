import { defineCard } from "../define.js";

// EDHREC rank 20853.
// Makes Spirit → "Spirit Token (Great Arashin City)" (a plain 1/1 white Spirit).
//
// Rulings:
//   [2025-04-04] You choose whether to put +1/+1 counters on the creature or create a Spirit token
//     as the ability that includes the endure instruction is resolving.
//   [2025-04-04] If you can't put +1/+1 counters on the creature for any reason as an endure
//     ability resolves (for example, if the creature is no longer on the battlefield), you'll just
//     create a Spirit token.

const SPIRIT = { kind: "create-token", token: "Spirit Token (Great Arashin City)", count: 1 } as const;
// Endure 1 (rule 701.63): the choice only while it's still on the
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
        text: "Put a +1/+1 counter on this creature.",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      { text: "Create a 1/1 white Spirit creature token.", effect: SPIRIT },
    ],
  },
  else: SPIRIT,
} as const;
const TRIGGER_TEXT = "When this creature enters, it endures 1.";

export default defineCard({
  name: "Kin-Tree Nurturer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${TRIGGER_TEXT} (Put a +1/+1 counter on it or create a 1/1 white Spirit creature token.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: ENDURE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
