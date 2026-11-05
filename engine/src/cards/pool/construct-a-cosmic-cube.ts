import { defineCard } from "../define.js";

// Claim the Kingdom's Plan shape, with Mindslaver's `control-player` as the reflexive payoff.

const DRAW_TEXT =
  "Whenever you draw your second card each turn, create a 2/1 black Villain creature token with menace and put a plan counter on this enchantment.";
const PLAN_TEXT =
  "When the seventh plan counter is put on this enchantment, sacrifice it. When you do, you control target opponent during their next turn. (You see all cards that player could see and make all decisions for them.)";

export default defineCard({
  name: "Construct a Cosmic Cube",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Plan"],
  text: `${DRAW_TEXT}\n${PLAN_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Villain Token", count: 1 },
          { kind: "add-counter", target: "source", counter: "plan", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "plan", nth: 7 },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: {
          kind: "reflexive-trigger",
          targets: ["opponent"],
          effect: { kind: "control-player", target: 0 },
          text: "You control target opponent during their next turn.",
        },
      },
      resolve: null,
      text: PLAN_TEXT,
    },
  ],
});
