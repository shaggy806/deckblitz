import { defineCard } from "../define.js";

// EDHREC rank 10815. Delirium is an intervening "if" (rule 603.4), checked
// as it attacks and again as it resolves. N'Yami-Class Mother Ship's look:
// the top card onto the battlefield if it's a land and you choose to,
// otherwise into your hand.
const ATTACK =
  "Delirium — Whenever this creature attacks, if there are four or more card types among cards in your graveyard, look at the top card of your library. If it's a land card, you may put it onto the battlefield. If you don't put the card onto the battlefield, put it into your hand.";

export default defineCard({
  name: "Wickerfolk Thresher",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 5,
  toughness: 4,
  text: ATTACK,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "delirium" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        leftover: "hand",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
