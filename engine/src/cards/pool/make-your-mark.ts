import { defineCard } from "../define.js";

// EDHREC rank 19747. Blessed Defiance's delayed dies-trigger; the Spirit is
// the spell's controller's, whoever controlled the creature.
const TEXT =
  "Target creature gets +1/+0 until end of turn. When that creature dies this turn, create a 3/2 red and white Spirit creature token.";

export default defineCard({
  name: "Make Your Mark",
  manaCost: "{R/W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "create-token", token: "Spirit Token (Red-White)", count: 1 },
        text: "When that creature dies this turn, create a 3/2 red and white Spirit creature token.",
      },
    ],
  },
});
