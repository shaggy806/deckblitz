import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 14440. Lumberknot's dies trigger, narrowed to a
// creature with flying as it last existed (rule 603.10a).
//
// Rulings:
//   If another creature with flying is dealt lethal damage at the same time as Soulcatcher,
//   they'll be destroyed at the same time. Soulcatcher's ability won't save it.

const TEXT = "Whenever a creature with flying dies, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Soulcatcher",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", keyword: "flying" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
