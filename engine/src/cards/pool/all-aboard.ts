import { defineCard } from "../define.js";

// Skycoach Conductor's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Conductor makes in exile (722.3c). The
// creature returns as a new object (rule 400.7) — a Pilot can't be chosen.
export default defineCard({
  name: "All Aboard",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  prepareSpellOnly: true,
  text: "Exile target non-Pilot creature you control, then return that card to the battlefield under its owner's control.",
  targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", notSubtypes: ["Pilot"] } }],
  effect: { kind: "flicker", target: 0 },
});
