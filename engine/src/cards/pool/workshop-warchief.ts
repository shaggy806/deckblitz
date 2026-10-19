import { defineCard } from "../define.js";

const BLITZ_TEXT =
  'Blitz {4}{G}{G} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

export default defineCard({
  name: "Workshop Warchief",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino", "Warrior"],
  power: 5,
  toughness: 3,
  keywords: ["trample"],
  text:
    "Trample\nWhen this creature enters, you gain 3 life.\n" +
    `When this creature dies, create a 4/4 green Rhino Warrior creature token.\n${BLITZ_TEXT}`,
  blitz: { cost: "{4}{G}{G}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, you gain 3 life.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Rhino Warrior Token", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 4/4 green Rhino Warrior creature token.",
    },
  ],
});
