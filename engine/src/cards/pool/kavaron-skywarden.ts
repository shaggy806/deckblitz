import { defineCard } from "../define.js";

// EDHREC rank 21918.

export default defineCard({
  name: "Kavaron Skywarden",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu", "Soldier"],
  power: 4,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach\nVoid — At the beginning of your end step, if a nonland permanent left the battlefield this turn or a spell was warped this turn, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Void — At the beginning of your end step, if a nonland permanent left the battlefield this turn or a spell was warped this turn, put a +1/+1 counter on this creature.",
      condition: {
        kind: "any",
        of: [
          {
            kind: "turn-history",
            what: "left",
            who: "any-player",
            filter: { notTypes: ["land"] },
          },
          { kind: "cast-this-turn", who: "any", filter: { castVia: "warp" } },
        ],
      },
    },
  ],
});
