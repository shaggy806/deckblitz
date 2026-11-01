import { defineCard } from "../define.js";

// EDHREC rank 589.
const ATTACK_TEXT = "Whenever Six attacks, mill three cards. You may put a land card from among them into your hand.";
const RETRACE_TEXT = "During your turn, nonland permanent cards in your graveyard have retrace.";

export default defineCard({
  name: "Six",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Treefolk"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${ATTACK_TEXT}\n${RETRACE_TEXT} (You may cast permanent cards from your graveyard by discarding a land card in addition to paying their other costs.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantsToGraveyard: {
        filter: { notTypes: ["land", "instant", "sorcery"] },
        keywords: [{ keyword: "retrace" }],
      },
      text: RETRACE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", type: "land" },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
