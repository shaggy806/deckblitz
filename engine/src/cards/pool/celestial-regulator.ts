import { defineCard } from "../define.js";

// Streets of New Capenna. Whether you control a creature with a counter on
// it is checked as the ability resolves.
const ENTER_TEXT =
  "When this creature enters, choose target creature you don't control and tap it. If you control a creature with a counter on it, the chosen creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Celestial Regulator",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Angel", "Advisor"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "conditional",
        condition: {
          kind: "controls",
          filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
          atLeast: 1,
        },
        then: { kind: "tap", target: 0, doesntUntapNext: true },
        else: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
