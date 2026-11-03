import { defineCard } from "../define.js";

// Time Spiral. "Target face-up exiled card" (`card-in-exile`'s `faceUp`): a
// card exiled face down isn't a legal target. It goes to its owner's
// graveyard, wherever it was exiled from (`put-into-graveyard`).
const TEXT = "Put target face-up exiled card into its owner's graveyard.";

export default defineCard({
  name: "Pull from Eternity",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "card-in-exile", faceUp: true }],
  effect: { kind: "put-into-graveyard", target: 0 },
});
