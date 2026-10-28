import { defineCard } from "../define.js";

const TRIGGER = "Whenever an opponent casts a spell with the chosen name, they lose 3 life and you draw a card.";

export default defineCard({
  name: "Silverquill Silencer",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 2,
  chooseCardNameOnEnter: { filter: { notTypes: ["land"] } },
  text: `As this creature enters, choose a nonland card name.\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { chosenName: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3, who: "trigger-controller" },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
