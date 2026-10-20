import { defineCard } from "../define.js";

// EDHREC rank 18276. Felonious Rage's shape: a delayed trigger watching the
// target die this turn; the Spirit is the spell's controller's.
const TEXT =
  "Target creature you control gets +2/+0 and gains lifelink until end of turn. When that creature dies this turn, create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Blessed Defiance",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "create-token", token: "Spirit Token", count: 1 },
        text: "When that creature dies this turn, create a 1/1 white Spirit creature token with flying.",
      },
    ],
  },
});
