import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

const TEXT =
  "{2}{G}, Pay 3 life for each velocity counter on this enchantment: Destroy target permanent and put a velocity counter on this enchantment. Activate only once each turn.";

export default defineCard({
  name: "Tornado",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `Cumulative upkeep {G} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${TEXT}`,
  triggered: [cumulativeUpkeep("{G}")],
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false, payLife: { each: 3, per: { countersOnSource: "velocity" } } },
      targets: ["permanent"],
      oncePerTurn: true,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "add-counter", target: "source", counter: "velocity", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
