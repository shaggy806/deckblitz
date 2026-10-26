import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 10532.
//
// "Can't be spent to cast spells" is a deny-list matching every spell
// (`notSpell: {}`): the mana still pays for abilities. It empties at the end
// of the upkeep like any mana (the ruling).

const TEXT = "At the beginning of your upkeep, you may add {C}{C}. This mana can't be spent to cast spells.";

export default defineCard({
  name: "Thran Turbine",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Add {C}{C}?",
        effect: {
          kind: "add-mana",
          mana: "C",
          amount: 2,
          spendOnly: { notSpell: {}, text: "This mana can't be spent to cast spells." },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
