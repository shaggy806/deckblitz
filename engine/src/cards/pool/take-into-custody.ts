import { defineCard } from "../define.js";

// EDHREC rank 23838.
//
// Rulings:
//   [2017-02-09] Take into Custody can target a creature that's already tapped. That creature
//     won't untap during its controller's next untap step.

export default defineCard({
  name: "Take into Custody",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap target creature. It doesn't untap during its controller's next untap step.",
  targets: ["creature"],
  effect: { kind: "tap", target: 0, doesntUntapNext: true },
});
