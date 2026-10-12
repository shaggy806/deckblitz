import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 11864. Marvel Super Heroes.
//
// X is read once, as the ability resolves — Captain America's toughness then,
// or as he last existed if he has left — and the Heroes it applies to are
// fixed then too (rule 611.2c).

const ATTACK_TEXT =
  "Whenever Captain America attacks, each other Hero you control gets +X/+X until end of turn, where X is Captain America's toughness.";

export default defineCard({
  name: "Captain America, Wings of Freedom",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 3,
  toughness: 1,
  keywords: ["flying", "first-strike"],
  text: `Flying, first strike, ward {1}\n${ATTACK_TEXT}`,
  triggered: [
    ward({ mana: "{1}" }),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Hero", controlledBy: "you" },
        power: { toughnessOf: "source" },
        toughness: { toughnessOf: "source" },
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
