import { investigate } from "../helpers.js";
import { defineCard } from "../define.js";

// Rulings: any number of target players, none included; a target player found
// illegal as it resolves isn't counted (its slot is blank); the extra cost is
// paid even on a free cast, and the mana value never changes.

/** The creatures the player in group slot `slot` controls — 0 for a slot
 * left empty or gone illegal. The group fills slots 0.. (four players at most). */
const creaturesOf = (slot: number) =>
  ({ countOf: { type: "creature", controlledBy: "you" }, forTarget: slot }) as const;

export default defineCard({
  name: "Officious Interrogation",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  costPerExtraTarget: "{W}{U}",
  text: "This spell costs {W}{U} more to cast for each target beyond the first.\nChoose any number of target players. Investigate X times, where X is the total number of creatures those players control.",
  targets: [{ kind: "any-number", of: "player" }],
  // "Investigate X times" as Ethereal Investigator authors it: X Clues.
  effect: investigate({ sum: [creaturesOf(0), creaturesOf(1), creaturesOf(2), creaturesOf(3)] }),
});
