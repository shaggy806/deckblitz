import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

const TEXT =
  "Whenever you pay this enchantment's cumulative upkeep, you may search your library for a creature card with mana value equal to the number of age counters on this enchantment, put it onto the battlefield, then shuffle.";

const upkeep = cumulativeUpkeep("{1}");

// The payment announces itself once made for every age counter
// (`cumulative-upkeep-paid`), so this triggers after the upkeep resolves; the
// mana value must equal the age counters exactly (the ruling), read as this
// resolves.
export default defineCard({
  name: "Hibernation's End",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${upkeep.text}\n${TEXT}`,
  triggered: [
    upkeep,
    {
      trigger: { on: "event", event: "cumulative-upkeep-paid", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a creature card with mana value equal to the age counters and put it onto the battlefield?",
        effect: {
          kind: "search-library",
          filter: { type: "creature", manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "age" } } } },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
