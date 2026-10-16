import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 22850. Myr Battlesphere's shape: tap any number of untapped
// creatures you control as the trigger resolves, then +1/+1 for each one
// tapped this way (one already tapped isn't tapped again, so isn't counted).
//
// Rulings:
//   If Orphans of the Wheat is untapped as its ability is resolving (for example, if it has
//     vigilance), it can be tapped for its own ability.
//   You can tap any untapped creatures you control, including creatures you haven't controlled
//     continuously since the beginning of your most recent turn, for Orphans of the Wheat's
//     ability.
const ATTACK_TEXT =
  "Whenever this creature attacks, tap any number of untapped creatures you control. This creature gets +1/+1 until end of turn for each creature tapped this way.";

const UNTAPPED_CREATURE: CardFilter = { type: "creature", controlledBy: "you", tapped: false };

export default defineCard({
  name: "Orphans of the Wheat",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 1,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: UNTAPPED_CREATURE,
            min: 0,
            upTo: { countOf: UNTAPPED_CREATURE },
            then: { kind: "tap", target: 0 },
            prompt: "Tap any number of untapped creatures you control",
          },
          {
            kind: "modify-pt",
            target: "source",
            power: { thisWay: "tapped" },
            toughness: { thisWay: "tapped" },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
