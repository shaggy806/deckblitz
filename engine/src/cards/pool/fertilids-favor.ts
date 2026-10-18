import { defineCard } from "../define.js";

// EDHREC rank 13632. March of the Machine.
//
// Restorative Technique's shape: the target player searches their own
// library and may fail to find (rule 701.23b), then shuffles; the land enters
// under their control. The second slot is optional ("up to one").

const TEXT =
  "Target player searches their library for a basic land card, puts it onto the battlefield tapped, then shuffles. Put two +1/+1 counters on up to one target artifact or creature.";

export default defineCard({
  name: "Fertilid's Favor",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: ["player", { kind: "optional", of: "artifact-or-creature" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        who: { controllerOfTarget: 0 },
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 2 },
    ],
  },
});
