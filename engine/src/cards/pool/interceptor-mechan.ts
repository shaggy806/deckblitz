import { defineCard } from "../define.js";

// EDHREC rank 13288.

export default defineCard({
  name: "Interceptor Mechan",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, return target artifact or creature card from your graveyard to your hand.\nVoid — At the beginning of your end step, if a nonland permanent left the battlefield this turn or a spell was warped this turn, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["artifact", "creature"] },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "When this creature enters, return target artifact or creature card from your graveyard to your hand.",
    },
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
