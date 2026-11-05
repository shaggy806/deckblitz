import { defineCard } from "../define.js";

const TRIGGER_TEXT = "Whenever a creature you control of the chosen type enters or attacks, draw a card.";

export default defineCard({
  name: "Kindred Discovery",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: `As this enchantment enters, choose a creature type.\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", ofChosenType: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", ofChosenType: true } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
