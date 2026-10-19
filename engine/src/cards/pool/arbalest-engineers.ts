import { defineCard } from "../define.js";

// The Brothers' War. A modal triggered ability: the mode (and its target) is
// chosen as it goes on the stack (`announced`).
const ENTERS_TEXT = "When this creature enters, choose one —";

export default defineCard({
  name: "Arbalest Engineers",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text:
    `${ENTERS_TEXT}\n• This creature deals 1 damage to any target.\n` +
    "• Put a +1/+1 counter on target creature. It gains trample and haste until end of turn.\n" +
    '• Create a tapped Powerstone token. (It\'s an artifact with "{T}: Add {C}. This mana can\'t be spent to ' +
    'cast a nonartifact spell.")',
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "This creature deals 1 damage to any target.",
            targets: ["any-target"],
            effect: { kind: "damage", amount: 1, target: 0 },
          },
          {
            text: "Put a +1/+1 counter on target creature. It gains trample and haste until end of turn.",
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
                { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
              ],
            },
          },
          {
            text: "Create a tapped Powerstone token.",
            effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
