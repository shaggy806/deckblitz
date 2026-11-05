import { defineCard } from "../define.js";

const ENTERS_TEXT = "This creature enters with X +1/+1 counters on it.";
const GROW_TEXT =
  "Whenever one or more +1/+1 counters are put on another non-Hydra creature you control, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Wildwood Scourge",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${GROW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "counters-put",
        who: "you-control",
        counter: "+1/+1",
        filter: { type: "creature", notSubtypes: ["Hydra"] },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
