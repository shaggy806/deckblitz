import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] Once Siege Striker's ability has resolved, it keeps the power-and-toughness bonus
//     even if some of the tapped creatures leave the battlefield or become untapped.
//   [2020-06-23] If Siege Striker gains vigilance and attacks or attacks and becomes untapped
//     before its last ability resolves, it can be tapped for its own ability.
//   [2020-06-23] You choose how many and which creatures to tap while Siege Striker's ability is
//     resolving.

const UNTAPPED_CREATURE: CardFilter = { type: "creature", controlledBy: "you", tapped: false };

export default defineCard({
  name: "Siege Striker",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: "Double strike (This creature deals both first-strike and regular combat damage.)\nWhenever this creature attacks, you may tap any number of untapped creatures you control. This creature gets +1/+1 until end of turn for each creature tapped this way.",
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
      text: "Whenever this creature attacks, you may tap any number of untapped creatures you control. This creature gets +1/+1 until end of turn for each creature tapped this way.",
    },
  ],
});
