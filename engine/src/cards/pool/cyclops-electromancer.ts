import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, it deals X damage to target creature an opponent controls, where X is the number of instant and sorcery cards in your graveyard.";

// X is counted as the ability resolves; a card that's both an instant and a
// sorcery counts once (the rulings).
export default defineCard({
  name: "Cyclops Electromancer",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops", "Wizard"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "damage",
        amount: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
        target: 0,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
