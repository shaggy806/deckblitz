import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 11784. Two triggers for the two halves of "The Ghoul or another
// nontoken Zombie or Mutant you control" (Headless Rider's shape). "If that
// player is you" is the `target-is-you` condition (B308), asked of the target
// as it resolves — whether or not The Ghoul is still around.
const DIES =
  "Whenever The Ghoul or another nontoken Zombie or Mutant you control dies, target player gets two rad counters. If that player is you, create a Treasure token.";

const RADS: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "add-player-counters", counter: "rad", amount: 2, target: 0 },
    {
      kind: "conditional",
      condition: { kind: "target-is-you", index: 0 },
      then: { kind: "create-token", token: "Treasure Token", count: 1 },
    },
  ],
};

export default defineCard({
  name: "The Ghoul, Gunslinger",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Mutant", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${DIES}`,
  triggered: [
    { trigger: { on: "dies", who: "self" }, targets: ["player"], effect: RADS, resolve: null, text: DIES },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", token: false, anyOf: [{ subtype: "Zombie" }, { subtype: "Mutant" }] },
        otherOnly: true,
      },
      targets: ["player"],
      effect: RADS,
      resolve: null,
      text: DIES,
    },
  ],
});
