import { defineCard } from "../define.js";
import { offspringTrigger } from "../helpers.js";

// EDHREC rank 8701. Bloomburrow.
//
// Offspring (rule 702.175) is the optional additional cost under its own
// keyword, and `offspringTrigger()` makes the 1/1 copy. The target trigger is
// Thunderbreak Regent's "a creature you control … an opponent controls",
// announced once per object however many of a spell's slots name it (the
// ruling); its target is a real choice "other than that creature" — the
// trigger object — so the targeting player never fills it.
const TEXT =
  "Whenever a creature you control becomes the target of a spell or ability an opponent controls, put a +1/+1 counter on target creature you control other than that creature.";

export default defineCard({
  name: "Pawpatch Recruit",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rabbit", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["trample"],
  text: `Offspring {2} (You may pay an additional {2} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\nTrample\n${TEXT}`,
  triggered: [
    offspringTrigger(),
    {
      trigger: { on: "becomes-target", who: "you-control", filter: { type: "creature" }, byOpponentOnly: true },
      targets: [{ kind: "other", than: "trigger-object", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
  kicker: { cost: "{2}", keyword: "offspring" },
});
