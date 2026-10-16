import { defineCard } from "../define.js";
import { GIFT_KICKER } from "../helpers.js";

// EDHREC rank 9846. Bloomburrow.
//
// Gift a tapped Fish (rule 702.174): given first as the spell resolves. Then
// the counter on the creature you control, promised only, and the fight. With
// your creature an illegal target there's no counter and no fight; with only
// the other one illegal the counter still goes on, and there's no fight
// (rule 701.14b, the rulings).
export default defineCard({
  name: "Longstalk Brawl",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Gift a tapped Fish (You may promise an opponent a gift as you cast this spell. If you do, they create a tapped 1/1 blue Fish creature token before its other effects.)\nChoose target creature you control and target creature you don't control. Put a +1/+1 counter on the creature you control if the gift was promised. Then those creatures fight each other.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1 },
  kicker: {
    ...GIFT_KICKER,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gift", gift: "tapped-fish" },
        { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        { kind: "fight", a: 0, b: 1 },
      ],
    },
  },
});
