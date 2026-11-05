import { defineCard } from "../define.js";

const ALLY_TEXT =
  "Whenever this creature or another Ally you control enters, target player reveals a number of cards from their hand equal to the number of Allies you control. You choose one of them. That player discards that card.";

export default defineCard({
  name: "Bala Ged Thief",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Ally"],
  power: 2,
  toughness: 2,
  text: ALLY_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: ["player"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        reveals: { countOf: { subtype: "Ally", controlledBy: "you" } },
      },
      resolve: null,
      text: ALLY_TEXT,
    },
  ],
});
