import { defineCard } from "../define.js";

// "Your life total becomes N" is a gain or a loss of the difference (rule
// 119.5 — the ruling: life-gain and life-loss effects see it), Loxodon
// Lifechanter's shape, with N the charge counters on it as the trigger
// resolves.

const ENTER_TEXT = "This artifact enters with X charge counters on it, where X is your life total.";
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, you may have your life total become the number of charge counters on this artifact.";
const CHARGE = { countersOn: "source", counter: "charge" } as const;
const LIFE = { lifeTotal: "you" } as const;

export default defineCard({
  name: "Eternity Vessel",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${LANDFALL_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: LIFE } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have your life total become the number of charge counters on Eternity Vessel?",
        effect: {
          kind: "conditional",
          condition: { kind: "self-counters", counter: "charge", compare: { op: "gt", n: { amount: LIFE } } },
          then: { kind: "gain-life", amount: { difference: [CHARGE, LIFE] } },
          else: {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "charge", compare: { op: "lt", n: { amount: LIFE } } },
            then: { kind: "lose-life", amount: { difference: [LIFE, CHARGE] } },
          },
        },
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
