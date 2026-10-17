import { defineCard } from "../define.js";

// EDHREC rank 20680.
//
// Rulings:
//   [2023-06-16] If the target creature's controller has zero cards left in their library when
//     Isolation at Orthanc resolves, that creature becomes the top card of their library.

export default defineCard({
  name: "Isolation at Orthanc",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put target creature into its owner's library second from the top.",
  targets: ["creature"],
  effect: { kind: "put-on-library", target: 0, position: { fromTop: 2 } },
});
