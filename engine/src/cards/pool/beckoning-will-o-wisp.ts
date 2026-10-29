import { defineCard } from "../define.js";

// Commander Legends: Battle for Baldur's Gate. Triarch Stalker's shape with a
// +1/+0: each combat's choice replaces the one before (`remember`).

const LURE =
  "Lure the Unwary — At the beginning of combat on your turn, choose an opponent. Creatures attacking the last chosen player get +1/+0.";

export default defineCard({
  name: "Beckoning Will-o'-Wisp",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${LURE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "choose-opponent", remember: true, then: { kind: "sequence", effects: [] } },
      resolve: null,
      text: LURE,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attackingChosenPlayer: true } },
      grantPt: [1, 0],
      text: LURE,
    },
  ],
});
