import { defineCard } from "../define.js";

// EDHREC rank 20529.
// Makes Spirit → "Spirit Token (Dusyut Earthcarver)" (a plain 3/3 white Spirit).
//
// Rulings:
//   [2025-04-04] You choose whether to put +1/+1 counters on the creature or create a Spirit token
//     as the ability that includes the endure instruction is resolving.
//   [2025-04-04] If you can't put +1/+1 counters on the creature for any reason as an endure
//     ability resolves (for example, if the creature is no longer on the battlefield), you'll just
//     create a Spirit token.

const SPIRIT = { kind: "create-token", token: "Spirit Token (Dusyut Earthcarver)", count: 1 } as const;
// Endure 3 (rule 701.63): the choice only while it's still on the
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
        text: "Put three +1/+1 counters on this creature.",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
      },
      { text: "Create a 3/3 white Spirit creature token.", effect: SPIRIT },
    ],
  },
  else: SPIRIT,
} as const;
const TRIGGER_TEXT = "When this creature enters, it endures 3.";

export default defineCard({
  name: "Dusyut Earthcarver",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant", "Druid"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${TRIGGER_TEXT} (Put three +1/+1 counters on it or create a 3/3 white Spirit creature token.)`,
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
