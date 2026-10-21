import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever another creature you control enters or dies, if that creature's power is greater than this creature's, put a +1/+1 counter on this creature.";
const TRAMPLE_TEXT = "As long as this creature has three or more +1/+1 counters on it, it has trample.";

const BIGGER: CardFilter = { type: "creature", power: { op: "gt", n: { amount: { powerOf: "source" } } } };

// An intervening "if" (rule 603.4): checked as the creature enters or dies
// and again as this resolves — a creature that has left (or died) as it last
// existed on the battlefield (the rulings).
const counter = {
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "trigger-object", filter: BIGGER },
    then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
  },
  resolve: null,
  text: TRIGGER_TEXT,
} as const;

export default defineCard({
  name: "Pelt Collector",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 1,
  toughness: 1,
  text: `${TRIGGER_TEXT}\n${TRAMPLE_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "you-control", filter: BIGGER, otherOnly: true }, ...counter },
    { trigger: { on: "dies", who: "you-control", filter: BIGGER, otherOnly: true }, sameAbilityAs: 0, ...counter },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 3 } },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
