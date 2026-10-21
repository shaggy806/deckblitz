import { defineCard } from "../define.js";

// EDHREC rank 11034.
//
// Rulings:
//   [2004-10-04] Retrieves all artifacts owned by the target player regardless of who controls
//     them. Ignores artifacts owned by other players even if target player has control of them.
//   [2004-10-04] It only returns artifacts which are on the battlefield.

export default defineCard({
  name: "Hurkyl's Recall",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return all artifacts target player owns to their hand.",
  targets: ["player"],
  // `controlledByTarget` reads the filter from the target player's side, so
  // `ownedBy: "you"` is "that player owns", whoever controls it.
  effect: { kind: "return-to-hand-all", filter: { type: "artifact", ownedBy: "you" }, controlledByTarget: 0 },
});
