import { defineCard } from "../define.js";

// EDHREC rank 6138.

const I_TEXT = "I — Create a 1/1 white Human Soldier creature token.";
const II_TEXT = "II — Put three +1/+1 counters on target creature you control.";
const III_TEXT = "III — If you control a creature with power 4 or greater, draw two cards.";
const IV_TEXT = 'IV — Create a Gold token. (It\'s an artifact with "Sacrifice this token: Add one mana of any color.")';

export default defineCard({
  name: "The First Iroan Games",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}\n${IV_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
        then: { kind: "draw", amount: 2 },
      },
      resolve: null,
      text: III_TEXT,
    },
    {
      at: [4],
      targets: [],
      effect: { kind: "create-token", token: "Gold Token", count: 1 },
      resolve: null,
      text: IV_TEXT,
    },
  ],
});
