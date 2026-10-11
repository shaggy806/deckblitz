import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// EDHREC rank 15140.
//
// Valakut, the Molten Pinnacle's trigger shape: an intervening "if", asked as
// it triggers and again as it resolves, of the Forests other than the one that
// entered — those entering alongside it count (the rulings).

const TRIGGER_TEXT =
  "Whenever a Forest you control enters, if you control at least five other Forests, target creature you control gets +3/+3 until end of turn.";

export default defineCard({
  name: "Roiling Canopy",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n${TRIGGER_TEXT}\n{T}: Add {G}.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Forest" } },
      condition: {
        kind: "controls",
        filter: { subtype: "Forest" },
        atLeast: 5,
        excludeTriggerObject: true,
      },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [manaTapAbility("G")],
});
