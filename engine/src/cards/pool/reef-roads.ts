import { defineCard } from "../define.js";

// EDHREC rank 11669.
//
// Rulings:
//   [2025-02-07] Saddling a Mount or crewing a Vehicle doesn't cause the token's power to change.
//
// The Pilot token's crew bonus is its own static (`crewsAs`, rules 702.122a
// and 702.171a).
const ENTERS_TEXT = "This land enters tapped unless you control a Mount or Vehicle.";
const PILOT_TEXT =
  '{1}{U}, {T}, Sacrifice this land: Create a 1/1 colorless Pilot creature token with "This token saddles Mounts and crews Vehicles as though its power were 2 greater." Activate only as a sorcery.';

export default defineCard({
  name: "Reef Roads",
  colors: [],
  types: ["land"],
  text: `${ENTERS_TEXT}\n{T}: Add {U}.\n${PILOT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { subtypes: ["Mount", "Vehicle"] }, atLeast: 1 },
      },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
    {
      cost: { mana: "{1}{U}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Pilot Token", count: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: PILOT_TEXT,
    },
  ],
});
