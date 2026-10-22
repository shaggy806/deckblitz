import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 26688.
//
// "When this artifact leaves the battlefield this turn, destroy that
// creature" is a delayed trigger set up as the ability resolves, watching
// War Barge's own stint for a departure to anywhere this turn (rule 603.7c —
// Golden Guardian's `leaves: "source"`). If War Barge has already left by
// then, the watch is on an object that can't leave again, so nothing fires.

const TEXT =
  "{3}: Target creature gains islandwalk until end of turn. When this artifact leaves the battlefield this turn, destroy that creature. A creature destroyed this way can't be regenerated.";

export default defineCard({
  name: "War Barge",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (A creature with islandwalk can't be blocked as long as defending player controls an Island.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "islandwalk", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: { leaves: "source", to: ["graveyard", "exile", "hand", "library", "command"], thisTurn: true },
            effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
            text: "When War Barge leaves the battlefield this turn, destroy that creature. It can't be regenerated.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
