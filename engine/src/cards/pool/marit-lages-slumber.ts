import { defineCard } from "../define.js";

// Rulings: the upkeep ability is an intervening-if (rule 603.4) — it doesn't
// trigger without ten snow permanents, and does nothing if there aren't ten
// as it resolves; with the Slumber gone, nothing is sacrificed and no Marit
// Lage is made ("if you do"). The Slumber is itself snow, so it counts
// towards the ten, and its own entry is one of the scry triggers.
const SCRY_TEXT = "Whenever Marit Lage's Slumber or another snow permanent you control enters, scry 1.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if you control ten or more snow permanents, sacrifice Marit Lage's Slumber. If you do, create Marit Lage, a legendary 20/20 black Avatar creature token with flying and indestructible.";

export default defineCard({
  name: "Marit Lage's Slumber",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary", "snow"],
  types: ["enchantment"],
  text: `${SCRY_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { supertype: "snow" } },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: SCRY_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { supertype: "snow" }, atLeast: 10 },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: { kind: "create-token", token: "Marit Lage Token", count: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
