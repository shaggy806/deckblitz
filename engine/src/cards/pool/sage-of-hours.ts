import { defineCard } from "../define.js";

const HEROIC_TEXT = "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on it.";
const TURNS_TEXT =
  "Remove all +1/+1 counters from this creature: For each five counters removed this way, take an extra turn after this one.";

export default defineCard({
  name: "Sage of Hours",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${HEROIC_TEXT}\n${TURNS_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
  activated: [
    {
      // X is how many counters came off.
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: "all" } },
      targets: [],
      effect: {
        kind: "repeat",
        times: { half: "x", round: "down", fraction: 5 },
        effect: { kind: "take-extra-turn" },
      },
      resolve: null,
      text: TURNS_TEXT,
    },
  ],
});
