import { defineCard } from "../define.js";

// EDHREC rank 14775. Marvel Super Heroes. Feign Death's return of the dying
// creature, with Admiral Brass's finality counter (which `moveObject` reads)
// and Portal to Phyrexia's "is a [type] in addition to its other types" —
// in place as it enters, for as long as it stays. Under its owner's control,
// whoever controlled the Villain. A token that died is gone (rule 704.5d)
// and isn't returned.

const TEXT =
  "Whenever a Villain you control dies, return it to the battlefield under its owner's control with a finality counter on it. That creature is a Hero in addition to its other types. (If a creature with a finality counter on it would die, exile it instead.)";

export default defineCard({
  name: "Thunderbolts Conspiracy",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Villain" } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "finality", amount: 1 },
        addSubtypes: ["Hero"],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
