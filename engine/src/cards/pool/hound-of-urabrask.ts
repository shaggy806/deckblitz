import { defineCard } from "../define.js";

// Playtest card. Oildying is undying with oil counters: the same triggered
// ability (the helpers' `undying`), its intervening "if" read from the
// creature as it last existed (rule 603.10a).

const OILDYING_TEXT =
  "Oildying (When this creature dies, if it had no oil counters on it, return it to the battlefield under its owner's control with an oil counter on it.)";
const PT_TEXT = "Hound of Urabrask gets +1/+1 for each oil counter on it.";
const STRIKE_TEXT = "As long as Hound of Urabrask has an oil counter on it, it has double strike.";

export default defineCard({
  name: "Hound of Urabrask",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian"],
  power: 3,
  toughness: 3,
  text: `${OILDYING_TEXT}\n${PT_TEXT}\n${STRIKE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { countersOnSource: "oil", pt: [1, 1] },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "oil", compare: { op: "gte", n: 1 } },
      grantKeywords: ["double-strike"],
      text: STRIKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "oil", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", withCounters: { kind: "oil", amount: 1 } },
      resolve: null,
      text: OILDYING_TEXT,
    },
  ],
});
