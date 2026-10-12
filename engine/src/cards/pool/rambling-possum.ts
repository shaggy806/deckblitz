import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";
import type { CardFilter } from "../../filter.js";

// "Creatures that saddled it this turn" (rule 702.171c) are `saddledSource`:
// tapped for its saddle cost this turn and still the same objects. They're
// chosen as it resolves — not targeted — and returned together.
const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, it gets +1/+2 until end of turn. Then you may return any number of creatures that saddled it this turn to their owner's hand.";
const SADDLERS: CardFilter = { type: "creature", saddledSource: true };

export default defineCard({
  name: "Rambling Possum",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Possum", "Mount"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${saddleText(1)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 2, duration: "end-of-turn" },
          {
            kind: "choose-permanents",
            filter: SADDLERS,
            upTo: { countOf: SADDLERS },
            min: 0,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return any number of creatures that saddled Rambling Possum this turn to their owner's hand",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(1, saddleText(1))],
});
