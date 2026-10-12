import { defineCard } from "../define.js";

// EDHREC rank 15187. Marvel Super Heroes. Kang's connive as a trigger, and
// Red Ghost's second-card draw trigger.

const CONNIVE_TEXT =
  "When Madame Masque enters, she connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)";
const DRAW_TEXT =
  "Whenever you draw your second card each turn, create a 2/1 black Villain creature token with menace. (It can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Madame Masque",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 2,
  text: `${CONNIVE_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: CONNIVE_TEXT,
    },
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Villain Token", count: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
