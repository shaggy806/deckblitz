import { defineCard } from "../define.js";

// Legends. EDHREC rank 12485.
//
// Rulings:
//   Nicol Bolas's third ability triggers whenever it deals damage to an opponent for any
//   reason. It's not limited to combat damage.
const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice Nicol Bolas unless you pay {U}{B}{R}.";
const DAMAGE_TEXT = "Whenever Nicol Bolas deals damage to an opponent, that player discards their hand.";

export default defineCard({
  name: "Nicol Bolas",
  manaCost: "{2}{U}{U}{B}{B}{R}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{U}{B}{R}", text: "Pay {U}{B}{R}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: { kind: "discard-hand", who: "trigger-player" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
