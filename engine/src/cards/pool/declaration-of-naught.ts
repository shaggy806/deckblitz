import { defineCard } from "../define.js";

const COUNTER = "{U}: Counter target spell with the chosen name.";

// Ruling (2008-04-01): one half of a split card may be named; a spell cast
// as that half can be targeted.

export default defineCard({
  name: "Declaration of Naught",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  chooseCardNameOnEnter: {},
  text: `As this enchantment enters, choose a card name.\n${COUNTER}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [{ kind: "spell", filter: { chosenName: true } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: COUNTER,
    },
  ],
});
