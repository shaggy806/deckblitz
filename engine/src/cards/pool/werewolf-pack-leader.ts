import { defineCard } from "../define.js";

const PACK_TEXT =
  "Pack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this combat, draw a card.";
const ANIMATE_TEXT =
  "{3}{G}: Until end of turn, this creature has base power and toughness 5/3, gains trample, and isn't a Human.";

export default defineCard({
  name: "Werewolf Pack Leader",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 3,
  toughness: 3,
  text: `${PACK_TEXT}\n${ANIMATE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "turn-stat", stat: "power-attacked-with-this-combat", who: "you", atLeast: 6 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: PACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 5,
            toughness: 3,
            addTypes: [],
            addSubtypes: [],
            keywords: ["trample"],
            duration: "end-of-turn",
          },
          { kind: "add-types", target: "source", removeSubtypes: ["Human"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
