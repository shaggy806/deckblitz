import { defineCard } from "../define.js";

// "Is a creature", with no "still a planeswalker": the new card type replaces
// the old (rule 205.1a), for one that has an ability to lose or not. Which
// planeswalkers it reaches is fixed in layer 4 (rule 613.6), so it goes on
// reaching them in layers 6 and 7b though they aren't planeswalkers by then.
// With no loyalty counter left it's a planeswalker again, and goes (704.5i).

const DRAW = "When this enchantment enters, draw a card.";
const STATIC =
  "Each planeswalker with one or more loyalty counters on it loses all abilities and is a creature with power and toughness each equal to the number of loyalty counters on it.";

export default defineCard({
  name: "Spark Rupture",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${DRAW}\n${STATIC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "planeswalker", counters: { kind: "loyalty", compare: { op: "gte", n: 1 } } },
      },
      loseAllAbilities: true,
      setTypes: ["creature"],
      setBasePt: { power: { countersOnIt: "loyalty" }, toughness: { countersOnIt: "loyalty" } },
      text: STATIC,
    },
  ],
});
