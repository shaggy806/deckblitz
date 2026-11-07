import { defineCard } from "../define.js";

// Rulings:
//   The source of the copy from Gogo's ability is the same as the source of the original ability.
//   The copy will have the same targets as the ability it's copying unless you choose new ones.
//   If the ability that's copied has an X whose value was determined as it was activated, the
//     copy will have the same value of X.
//   Gogo's ability can copy any activated or triggered ability on the stack, not just one with
//     targets.
//
// "X times" is `copy-ability`'s `count`; "this ability can't be copied" the
// ability's `cantBeCopied`; "X can't be 0" its `minX`.

const TEXT =
  "{X}{X}, {T}: Copy target activated or triggered ability you control X times. You may choose new targets for the copies. This ability can't be copied and X can't be 0. (Mana abilities can't be targeted.)";

export default defineCard({
  name: "Gogo, Master of Mimicry",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wizard"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{X}", tap: true },
      minX: 1,
      cantBeCopied: true,
      targets: [{ kind: "ability", whose: "you" }],
      effect: { kind: "copy-ability", target: 0, newTargets: true, count: "x" },
      resolve: null,
      text: TEXT,
    },
  ],
});
