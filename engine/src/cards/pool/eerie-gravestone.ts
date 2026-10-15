import { defineCard } from "../define.js";

const SAC_TEXT =
  "{1}{B}, Sacrifice this artifact: Mill four cards. You may put a creature card from among them into your hand. (To mill four cards, put the top four cards of your library into your graveyard.)";

export default defineCard({
  name: "Eerie Gravestone",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `When this artifact enters, draw a card.\n${SAC_TEXT}`,
  activated: [
    {
      // Something Worth Saving's mill-and-keep, a creature card only.
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", type: "creature" },
          },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this artifact enters, draw a card.",
    },
  ],
});
