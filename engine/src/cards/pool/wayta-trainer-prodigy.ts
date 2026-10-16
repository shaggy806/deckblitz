import { defineCard } from "../define.js";

// #427 in top-commanders.txt.
//
// "This ability costs {2} less to activate if it targets two creatures you
// control" is the ability's `targetCostReduction` (`count: 2`): the cost is
// fixed as the targets are chosen (rule 601.2f), {G} with two of yours, and
// "another target creature" stays any other creature — one that changes
// control in response is still a legal target, and the fight happens.
const FIGHT_TEXT =
  "{2}{G}, {T}: Target creature you control fights another target creature. This ability costs {2} " +
  "less to activate if it targets two creatures you control.";
const DOUBLE_TEXT =
  "If a creature you control being dealt damage causes a triggered ability of a permanent you control " +
  "to trigger, that ability triggers an additional time.";

export default defineCard({
  name: "Wayta, Trainer Prodigy",
  manaCost: "{R}{G}{W}",
  colors: ["R", "G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 5,
  keywords: ["haste"],
  text: `Haste\n${FIGHT_TEXT}\n${DOUBLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: ["creature-you-control", { kind: "other", of: "creature", than: { slot: 0 } }],
      targetCostReduction: { filter: { type: "creature", controlledBy: "you" }, reduceGeneric: 2, count: 2 },
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: FIGHT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      doubleTriggers: { cause: "dealt-damage", filter: { type: "creature", controlledBy: "you" } },
      text: DOUBLE_TEXT,
    },
  ],
});
