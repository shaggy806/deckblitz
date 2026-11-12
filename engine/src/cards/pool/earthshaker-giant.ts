import { defineCard } from "../define.js";

// EDHREC rank 13969. Rumbleweed's enters trigger.

export default defineCard({
  name: "Earthshaker Giant",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant", "Druid"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, other creatures you control get +3/+3 and gain trample until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 3,
            toughness: 3,
            duration: "end-of-turn",
            exceptSource: true,
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
            exceptSource: true,
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, other creatures you control get +3/+3 and gain trample until end of turn.",
    },
  ],
});
