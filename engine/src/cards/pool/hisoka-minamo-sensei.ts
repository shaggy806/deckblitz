import { defineCard } from "../define.js";

// EDHREC rank 27245.
const TEXT = "{2}{U}, Discard a card: Counter target spell if it has the same mana value as the discarded card.";

export default defineCard({
  name: "Hisoka, Minamo Sensei",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false, discard: { count: 1 } },
      targets: ["spell"],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { manaValue: { op: "eq", n: { amount: { manaValueOf: { paid: "discarded" } } } } } },
        then: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
