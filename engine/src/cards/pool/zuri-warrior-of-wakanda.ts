import { defineCard } from "../define.js";

// EDHREC rank 17110.

const CAST_TEXT =
  "Whenever you cast an artifact spell with mana value 4 or greater, put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Zuri, Warrior of Wakanda",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { type: "artifact", manaValue: { op: "gte", n: 4 } },
      },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
