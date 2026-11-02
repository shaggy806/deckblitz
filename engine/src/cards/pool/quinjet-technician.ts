import { defineCard } from "../define.js";

const ONE_TEXT = "{T}: Add {R}.";
const TWO_TEXT = "{T}: Add {R}{R}. Spend this mana only to activate power-up abilities.";

export default defineCard({
  name: "Quinjet Technician",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
  text: `${ONE_TEXT}\n${TWO_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: ONE_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 2,
        spendOnly: {
          purposes: ["power-up-ability"],
          text: "Spend this mana only to activate power-up abilities.",
        },
      },
      resolve: null,
      text: TWO_TEXT,
    },
  ],
});
