import { defineCard } from "../define.js";

const ENTER_TEXT = "{1}{G}, {T}: This turn, each creature you control enters with an additional +1/+1 counter on it.";
const MOVE_TEXT = "{1}{U}, {T}: Move a +1/+1 counter from target creature you control onto another target creature you control.";

export default defineCard({
  name: "Combine Guildmage",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${MOVE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
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
      cost: { mana: "{1}{U}", tap: true },
      targets: ["creature-you-control", { kind: "other", of: "creature-you-control", than: { slot: 0 } }],
      effect: { kind: "move-counters", from: 0, to: 1, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: MOVE_TEXT,
    },
  ],
});
