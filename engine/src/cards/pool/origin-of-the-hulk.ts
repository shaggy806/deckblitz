import { defineCard } from "../define.js";

// EDHREC rank 23624.

const I_TEXT = "I — Create a 1/1 green and white Citizen creature token.";
const II_TEXT = "II — Put two +1/+1 counters on target creature you control.";
const III_TEXT = "III — Target creature you control gets +3/+3 and gains trample until end of turn.";

export default defineCard({
  name: "Origin of the Hulk",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Citizen Token", count: 1 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
