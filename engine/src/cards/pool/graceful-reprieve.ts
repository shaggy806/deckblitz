import { defineCard } from "../define.js";

// EDHREC rank 18241.
//
// Rulings:
//   [2017-03-14] Graceful Reprieve's effect works only once. If the targeted creature leaves the
//     battlefield and is then returned to the battlefield, it's considered to be a new creature.
//     If that new creature is put into a graveyard, it won't come back a second time.
//   [2017-03-14] Graceful Reprieve can target a token creature, but since tokens cease to exist
//     after they leave the battlefield, it won't be returned to the battlefield.

const TEXT = "When target creature dies this turn, return that card to the battlefield under its owner's control.";

export default defineCard({
  name: "Graceful Reprieve",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "delayed-trigger",
    at: { leaves: 0, to: ["graveyard"], thisTurn: true },
    effect: { kind: "put-onto-battlefield", target: "trigger-object" },
    text: "When that creature dies this turn, return that card to the battlefield under its owner's control.",
  },
});
