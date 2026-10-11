import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 6802.
//
// Two `others-enter-battlefield` replacements, split on the entering
// permanent's mana value as it will exist on the battlefield (rule 614.12 — a
// face-down 2/2 is mana value 0): one +1/+1 counter at 4 or less, three
// otherwise. A Vehicle that isn't a creature gets them too. Never itself, and
// never a permanent entering at the same time as it.

const TRAMPLE = "Trample";
const COUNTERS =
  "Each other Vehicle and creature you control enters with an additional +1/+1 counter on it if its mana value is 4 or less. Otherwise, it enters with three additional +1/+1 counters on it.";
const VEHICLE_OR_CREATURE = [{ subtype: "Vehicle" }, { type: "creature" }] as const;

export default defineCard({
  name: "Thunderous Velocipede",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `${TRAMPLE}\n${COUNTERS}\nCrew 3`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { controlledBy: "you", anyOf: VEHICLE_OR_CREATURE, manaValue: { op: "lte", n: 4 } },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: COUNTERS,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { controlledBy: "you", anyOf: VEHICLE_OR_CREATURE, manaValue: { op: "gte", n: 5 } },
        counters: { kind: "+1/+1", amount: 3 },
      },
      text: COUNTERS,
    },
  ],
  activated: [crew(3)],
});
