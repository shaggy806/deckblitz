import { defineCard } from "../define.js";

// Zendikar Rising (ZNR). EDHREC rank 19200. `tap` with `doesntUntapNext` marks
// the creature to skip its next untap even when it was already tapped (the
// ruling); the mill reads the creature's controller from the slot.

export default defineCard({
  name: "Glacial Grasp",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap target creature. Its controller mills two cards. That creature doesn't untap during its controller's next untap step. (They put the top two cards of their library into their graveyard.)\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "mill", target: 0, amount: 2 },
      { kind: "draw", amount: 1 },
    ],
  },
});
