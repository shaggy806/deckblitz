import { defineCard } from "../define.js";

// EDHREC rank 28954. "When that creature dies this turn, destroy this
// artifact" is a delayed trigger on the target's death this turn (rule 603.7c
// — Grim Javelineer's shape), set up as the ability resolves.

const TEXT = "{2}, {T}: Target creature gains islandwalk until end of turn. When that creature dies this turn, destroy this artifact.";

export default defineCard({
  name: "Sandals of Abdallah",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (A creature with islandwalk can't be blocked as long as defending player controls an Island.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "islandwalk", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: { leaves: 0, to: ["graveyard"], thisTurn: true },
            effect: { kind: "destroy", target: "source" },
            text: "When that creature dies this turn, destroy Sandals of Abdallah.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
