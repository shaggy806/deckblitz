import { defineCard } from "../define.js";

const DRAW_TEXT = "Whenever you draw a card, put a +1/+1 counter on Shang-Chi.";
const TENTH_TEXT = "When the tenth +1/+1 counter is put on Shang-Chi, you draw five cards and gain 5 life.";

export default defineCard({
  name: "Shang-Chi and the Ten Rings",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${DRAW_TEXT}\n${TENTH_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1", nth: 10 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 5 },
          { kind: "gain-life", amount: 5 },
        ],
      },
      resolve: null,
      text: TENTH_TEXT,
    },
  ],
});
