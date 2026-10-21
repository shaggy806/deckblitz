import { defineCard } from "../define.js";

const TEXT = "Undergrowth — When this creature enters, you gain 1 life for each creature card in your graveyard.";

export default defineCard({
  name: "Kraul Foragers",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Scout"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { countInGraveyard: { type: "creature", ownedBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
