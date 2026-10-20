import { defineCard } from "../define.js";

// The dies trigger's damage comes from Piru as it last existed on the
// battlefield, lifelink included (its ruling: you gain that much life).
const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice Piru unless you pay {R}{W}{B}.";
const DIES_TEXT = "When Piru dies, it deals 7 damage to each nonlegendary creature.";

export default defineCard({
  name: "Piru, the Volatile",
  manaCost: "{2}{R}{R}{W}{W}{B}{B}",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${UPKEEP_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{R}{W}{B}", text: "Pay {R}{W}{B}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", notSupertype: "legendary" },
        amount: 7,
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
