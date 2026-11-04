import { defineCard } from "../define.js";

const ENTERS = "This creature enters with a +1/+1 counter on it for each loyalty counter on planeswalkers you control.";
const GROWS = "Whenever one or more loyalty counters are put on planeswalkers you control, put that many +1/+1 counters on this creature.";

export default defineCard({
  name: "Bioessence Hydra",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Hydra", "Mutant"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${ENTERS}\n${GROWS}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            aggregate: "sum",
            of: { counters: "loyalty" },
            filter: { type: "planeswalker", controlledBy: "you" },
          },
        },
      },
      text: ENTERS,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "counters-put",
        who: "you-control",
        filter: { type: "planeswalker" },
        counter: "loyalty",
        batched: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: GROWS,
    },
  ],
});
