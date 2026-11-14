import { defineCard } from "../define.js";

const ENTER_TEXT = "{G}{U}: This turn, each creature you control enters with an additional +1/+1 counter on it.";
const DRAW_TEXT = "{G}{U}, Remove a +1/+1 counter from a creature you control: Draw a card.";

// The first ability's effect reaches creatures that enter later this turn,
// whether the Guildmage is still there or not (rule 611.2c).
export default defineCard({
  name: "Zameck Guildmage",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}{U}", tap: false },
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: {
          event: "others-enter-battlefield",
          filter: { type: "creature", controlledBy: "you" },
          counters: { kind: "+1/+1", amount: 1 },
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      cost: { mana: "{G}{U}", tap: false, removeCounter: { kind: "+1/+1", count: 1, from: { type: "creature" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
