import { defineCard } from "../define.js";

// EDHREC rank 2142.
/** A modal double-faced card (instant // land) — its back face, Hagra
 * Broodpit, is a land you play instead. "If an opponent controls no basic
 * lands" is `opponent-controls` bounded above (`atMost: 0`): some one
 * opponent with none. */
export default defineCard({
  name: "Hagra Mauling",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if an opponent controls no basic lands.\nDestroy target creature.",
  selfCostReduction: {
    condition: { kind: "opponent-controls", filter: { type: "land", supertype: "basic" }, atLeast: 0, atMost: 0 },
    reduceGeneric: 1,
  },
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
  faces: ["Hagra Mauling", "Hagra Broodpit"],
});
