import { defineCard } from "../define.js";

const MILL_ONE = "{1}, {T}: Target player mills a card. (They put the top card of their library into their graveyard.)";
const MILL_TWELVE = "Tap four untapped Advisors you control: Target player mills twelve cards.";

export default defineCard({
  name: "Persistent Petitioners",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 3,
  text: `${MILL_ONE}\n${MILL_TWELVE}\nA deck can have any number of cards named Persistent Petitioners.`,
  deckCopies: "any",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 1 },
      resolve: null,
      text: MILL_ONE,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 4, filter: { subtype: "Advisor", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 12 },
      resolve: null,
      text: MILL_TWELVE,
    },
  ],
});
