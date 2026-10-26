import { defineCard } from "../define.js";

const GRANTED_TEXT = "Whenever this creature is dealt damage, put a +1/+1 counter on it.";

export default defineCard({
  name: "Fungus Sliver",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Sliver"],
  power: 2,
  toughness: 2,
  text: `All Sliver creatures have "${GRANTED_TEXT}" (It must survive the damage to get the counter.)`,
  static: [
    {
      // Every Sliver creature, whoever controls it. Simultaneous damage from
      // several sources is one trigger (the ruling — `dealt-damage` batches).
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantsTriggered: [
        {
          trigger: { on: "dealt-damage", who: "self" },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `All Sliver creatures have "${GRANTED_TEXT}"`,
    },
  ],
});
