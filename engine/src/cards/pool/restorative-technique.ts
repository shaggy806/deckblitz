import { defineCard } from "../define.js";

// EDHREC rank 11814. Marvel Super Heroes.
//
// The target player searches their own library (Fertilid's shape) and may
// fail to find (rule 701.23b), then shuffles; the land enters under their
// control. The creature slot is optional ("up to one").

const TEXT =
  "Target player gains 2 life, then searches their library for a basic land card, puts it onto the battlefield tapped, then shuffles. Put a +1/+1 counter on up to one target creature.";

export default defineCard({
  name: "Restorative Technique",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player", { kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 2, toControllerOfTarget: 0 },
      {
        kind: "search-library",
        who: { controllerOfTarget: 0 },
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});
