import { defineCard } from "../define.js";

const TEXT = "When this creature enters, if there are three or more creature cards in your graveyard, you gain 5 life.";

export default defineCard({
  name: "Webweaver Changeling",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 5,
  keywords: ["changeling", "reach"],
  text: `Changeling (This card is every creature type.)\nReach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 5 },
      resolve: null,
      text: TEXT,
    },
  ],
});
