import { defineCard } from "../define.js";

// EDHREC rank 11842.
//
// Rulings:
//   [2010-03-01] If you cast Urge to Feed targeting an untapped Vampire creature you control with
//     toughness 3, its toughness will be reduced to 0 by the -3/-3 effect. However, state-based
//     actions aren't checked until the spell has finished resolving. You may then tap that Vampire
//     and put a +1/+1 counter on it, raising its toughness to 1. It will remain on the
//     battlefield.
//   [2010-03-01] You don't choose which untapped Vampire creatures you control to tap (if any)
//     until Urge to Feed resolves.
//   [2010-03-01] If the targeted creature is an illegal target by the time Urge to Feed resolves,
//     the entire spell doesn't resolve. You can't tap any Vampires.
//
// Ledev Champion's choose-permanents: each Vampire picked is tapped and then
// gets its counter.

const VAMPIRES = { type: "creature", subtype: "Vampire", controlledBy: "you", tapped: false } as const;

export default defineCard({
  name: "Urge to Feed",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -3/-3 until end of turn. You may tap any number of untapped Vampire creatures you control. If you do, put a +1/+1 counter on each of those Vampires.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      {
        kind: "choose-permanents",
        filter: VAMPIRES,
        min: 0,
        upTo: { countOf: VAMPIRES },
        then: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          ],
        },
        prompt: "Tap any number of untapped Vampire creatures you control",
      },
    ],
  },
});
