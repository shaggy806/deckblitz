import { defineCard } from "../define.js";

// EDHREC rank 13356.

export default defineCard({
  name: "Rot Wolf",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wolf"],
  power: 2,
  toughness: 2,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nWhenever a creature dealt damage by Rot Wolf this turn dies, you may draw a card.",
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
      },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever a creature dealt damage by Rot Wolf this turn dies, you may draw a card.",
    },
  ],
});
