import { defineCard } from "../define.js";

// EDHREC rank 12926. Scarblade's Malice's shape: a delayed trigger watching
// the target die this turn; the Detective is the spell's controller's.
const TEXT =
  "Target creature you control gets +2/+0 and gains haste until end of turn. When that creature dies this turn, create a 2/2 white and blue Detective creature token.";

export default defineCard({
  name: "Felonious Rage",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "create-token", token: "Detective Token", count: 1 },
        text: "When that creature dies this turn, create a 2/2 white and blue Detective creature token.",
      },
    ],
  },
});
