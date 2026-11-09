import { defineCard } from "../define.js";

const TEXT =
  "Whenever Erica Ortegas becomes tapped, you may put a land card from your hand onto the battlefield. If you do, return a land you control to its owner's hand at the beginning of the next end step.";
const RETURN_TEXT = "Return a land you control to its owner's hand.";

export default defineCard({
  name: "Erica Ortegas, Plucky Pilot",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "land" },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield" },
            then: {
              kind: "delayed-trigger",
              at: { step: "end" },
              effect: {
                kind: "choose-permanents",
                filter: { type: "land", controlledBy: "you" },
                min: 1,
                upTo: 1,
                then: { kind: "return-to-hand", target: 0 },
                prompt: RETURN_TEXT,
              },
              text: RETURN_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
