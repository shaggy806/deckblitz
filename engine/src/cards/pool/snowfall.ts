import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// A triggered mana ability (rule 605.1b). "If that Island is snow, … {U}{U}
// instead" is written as two abilities, split on the land: exactly one triggers.
// The may is the player's: tapped by hand, an offer with the mana and one
// without; paying a cost, it's taken when that payment can spend it.

const TEXT =
  "Whenever an Island is tapped for mana, its controller may add an additional {U}. If that Island is snow, its controller may add an additional {U}{U} instead. Spend this mana only to pay cumulative upkeep costs.";
const SPEND = { purposes: ["cumulative-upkeep"], text: "Spend this mana only to pay cumulative upkeep costs." } as const;
const UPKEEP = cumulativeUpkeep("{U}");

export default defineCard({
  name: "Snowfall",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UPKEEP.text}\n${TEXT}`,
  triggered: [
    UPKEEP,
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { subtype: "Island", notSupertype: "snow" } },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1, mayAdd: true, spendOnly: SPEND },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { subtype: "Island", supertype: "snow" } },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 2, mayAdd: true, spendOnly: SPEND },
      resolve: null,
      text: TEXT,
    },
  ],
});
