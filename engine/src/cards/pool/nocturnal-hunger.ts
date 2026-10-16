import { defineCard } from "../define.js";
import { GIFT_KICKER } from "../helpers.js";

// Bloomburrow (BLB). EDHREC rank 13015.
// Gift a Food (rule 702.174): promised, the chosen opponent creates a Food before the
// destroy, and you don't lose the 2 life; unpromised, Infernal Grasp.
export default defineCard({
  name: "Nocturnal Hunger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Gift a Food (You may promise an opponent a gift as you cast this spell. If you do, they create a Food token before its other effects. It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nDestroy target creature. If the gift wasn't promised, you lose 2 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "lose-life", amount: 2, who: "you" },
    ],
  },
  kicker: {
    ...GIFT_KICKER,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gift", gift: "food" },
        { kind: "destroy", target: 0 },
      ],
    },
  },
});
