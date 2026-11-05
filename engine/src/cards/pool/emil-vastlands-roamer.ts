import { defineCard } from "../define.js";

const TRAMPLE_TEXT = "Creatures you control with +1/+1 counters on them have trample.";
const FRACTAL_TEXT =
  "{4}{G}, {T}: Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of differently named lands you control.";

export default defineCard({
  name: "Emil, Vastlands Roamer",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 3,
  text: `${TRAMPLE_TEXT}\n${FRACTAL_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{G}", tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Fractal Token",
        count: 1,
        thenCounters: {
          kind: "+1/+1",
          amount: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
        },
      },
      resolve: null,
      text: FRACTAL_TEXT,
    },
  ],
});
