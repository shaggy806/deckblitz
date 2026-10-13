import { defineCard } from "../define.js";

// EDHREC rank 14984.
//
// Rulings:
//   [2025-02-07] Saddling a Mount or crewing a Vehicle doesn't cause the token's power to change.
//
// "Enchanted permanent gets +1/+1": a noncreature Vehicle's P/T only counts
// once it's crewed (rule 301.7b).
const PILOT_TEXT =
  'When this Aura enters, create a 1/1 colorless Pilot creature token with "This token saddles Mounts and crews Vehicles as though its power were 2 greater."';
const ANTHEM_TEXT = "Enchanted permanent gets +1/+1 and has lifelink.";

export default defineCard({
  name: "Roadside Assistance",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature or Vehicle\n${PILOT_TEXT}\n${ANTHEM_TEXT}`,
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], grantKeywords: ["lifelink"], text: ANTHEM_TEXT }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Pilot Token", count: 1 },
      resolve: null,
      text: PILOT_TEXT,
    },
  ],
});
