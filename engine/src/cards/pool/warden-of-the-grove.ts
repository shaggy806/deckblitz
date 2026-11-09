import { defineCard } from "../define.js";

// EDHREC rank 2183. Endure X (rule 701.63): X is every counter on this creature
// as it last existed if it has left (the ruling). The entered creature gone,
// no choice: just the Spirit.
const COUNTERS = { countersOn: "source" } as const;
const SPIRIT = {
  kind: "create-token",
  token: "Spirit Token (Abzan Monument)",
  count: 1,
  basePt: { power: COUNTERS, toughness: COUNTERS },
} as const;

const ENDURE_TEXT =
  "Whenever another nontoken creature you control enters, it endures X, where X is the number of counters on this creature. (Put X +1/+1 counters on the creature that entered or create an X/X white Spirit creature token.)";

export default defineCard({
  name: "Warden of the Grove",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 2,
  toughness: 2,
  text: `At the beginning of your end step, put a +1/+1 counter on this creature.\n${ENDURE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, put a +1/+1 counter on this creature.",
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", token: false }, otherOnly: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { inZone: "battlefield" } },
        then: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Put X +1/+1 counters on the creature that entered.",
              effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: COUNTERS },
            },
            { text: "Create an X/X white Spirit creature token.", effect: SPIRIT },
          ],
        },
        else: SPIRIT,
      },
      resolve: null,
      text: ENDURE_TEXT,
    },
  ],
});
