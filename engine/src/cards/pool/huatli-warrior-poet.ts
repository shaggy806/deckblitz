import { defineCard } from "../define.js";

// EDHREC rank 13092.
//
// Rulings:
//   [2017-09-29] The greatest power among creatures you control is determined as Huatli's first
//     ability resolves. If that number is negative, you won't gain or lose any life.
//   [2017-09-29] You can activate Huatli's first ability even if you control no creatures. You
//     simply won't gain any life.
//   [2017-09-29] If some (but not all) of the targets become illegal, the original division of
//     damage still applies, but no damage is dealt to illegal targets. If all targets become
//     illegal, the ability won't resolve.
//   [2017-09-29] You divide the damage among the target creatures as you activate Huatli's last
//     ability. Each target must be assigned at least 1 damage. If X is 0, you can't choose any
//     targets.
//
// −X (rule 107.3a): the group is X big at most, so the ability is offered once per X (its X
// fixed), and the division of X is announced as it's activated (rules 602.2b, 601.2d — Skarrgan
// Hellkite's `divided`). "Creatures dealt damage this way" is the set the damage actually reached
// (none prevented, rule 615.1), fixed as it resolves (`asItResolves`), not a rule for later.

const MINUS_X_TEXT =
  "−X: Huatli deals X damage divided as you choose among any number of target creatures. Creatures dealt damage this way can't block this turn.";

export default defineCard({
  name: "Huatli, Warrior Poet",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Huatli"],
  loyalty: 3,
  text: `+2: You gain life equal to the greatest power among creatures you control.\n0: Create a 3/3 green Dinosaur creature token with trample.\n${MINUS_X_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      // Read as it resolves (the ruling); none, or a negative greatest, gains nothing.
      effect: {
        kind: "gain-life",
        amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: "+2: You gain life equal to the greatest power among creatures you control.",
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Dinosaur Token", count: 1 },
      resolve: null,
      text: "0: Create a 3/3 green Dinosaur creature token with trample.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "creature", max: "x" }],
      divided: { total: "x", slot: 0 },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-divided", from: 0 },
          {
            kind: "restrict",
            filter: { type: "creature", thisWay: "dealt-damage" },
            asItResolves: true,
            restrictions: ["cant-block"],
          },
        ],
      },
      resolve: null,
      text: MINUS_X_TEXT,
    },
  ],
});
