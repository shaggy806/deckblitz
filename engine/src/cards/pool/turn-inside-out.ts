import { defineCard } from "../define.js";

// EDHREC rank 11102. Desperate Measures' death watch on the target, this
// turn only; the manifest dread is the spell's controller's, whoever
// controlled the creature.
const DIES = "When it dies this turn, manifest dread.";

export default defineCard({
  name: "Turn Inside Out",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Target creature gets +3/+0 until end of turn. ${DIES} (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "manifest-dread" },
        text: DIES,
      },
    ],
  },
});
