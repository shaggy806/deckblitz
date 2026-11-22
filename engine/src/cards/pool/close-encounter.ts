import { defineCard } from "../define.js";

// EDHREC rank 20077. "Choose a creature you control or a warped creature card
// you own in exile" is a mandatory additional cost in behold's shape with
// exile for the hand (`orWarpedInExile` — a warped card is one warp's delayed
// trigger exiled, rule 702.185b), chosen as the cost is paid (601.2h). The
// damage is the power of what was chosen (`{ paid: "beheld" }`).
//
// Rulings:
//   - A creature chosen on the battlefield: its power as Close Encounter
//     resolves, or as it last existed on the battlefield if it has left.

export default defineCard({
  name: "Close Encounter",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, choose a creature you control or a warped creature card you own in exile.\nClose Encounter deals damage equal to the power of the chosen creature or card to target creature.",
  additionalCost: {
    behold: {
      filter: { type: "creature" },
      text: "a creature you control or a warped creature card you own in exile",
      orWarpedInExile: true,
    },
  },
  targets: ["creature"],
  effect: { kind: "damage", amount: { powerOf: { paid: "beheld" } }, target: 0 },
});
