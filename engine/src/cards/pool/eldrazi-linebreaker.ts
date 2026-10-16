import { defineCard } from "../define.js";

// EDHREC rank 10482. X counts the Eldrazi you control as the trigger
// resolves (the ruling), a token stack counting every token in it.
const TEXT =
  "At the beginning of combat on your turn, target creature you control gains haste and gets +X/+0 until end of turn, where X is the number of Eldrazi you control.";

export default defineCard({
  name: "Eldrazi Linebreaker",
  manaCost: "{1}{C}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Devoid (This card has no color.)\nTrample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          {
            kind: "modify-pt",
            target: 0,
            power: { countOf: { subtype: "Eldrazi", controlledBy: "you" } },
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
