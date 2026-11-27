import { defineCard } from "../define.js";
import { exploit } from "../helpers.js";

// EDHREC rank 23413.

const GROW =
  "Whenever another creature you control dies, put a +1/+1 counter on this creature. It gains haste until end of turn if it exploited that creature.";

export default defineCard({
  name: "Silumgar Scavenger",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Bird"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\nExploit (When this creature enters, you may sacrifice a creature.)\n${GROW}`,
  triggered: [
    exploit(),
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            // "If it exploited that creature" (rule 702.110b): the creature
            // that died was sacrificed to this one's exploit ability.
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { journaled: { what: "sacrificed", bySource: true } } },
            then: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: GROW,
    },
  ],
});
