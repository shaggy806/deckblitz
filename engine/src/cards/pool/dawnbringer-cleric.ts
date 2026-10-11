import { defineCard } from "../define.js";

// EDHREC rank 6837.
//
// Pollenbright Druid's shape: an announced modal enters trigger, each
// targeted mode bringing its own target.
const ETB_TEXT = "When this creature enters, choose one —";
const CURE = "Cure Wounds — You gain 2 life.";
const DISPEL = "Dispel Magic — Destroy target enchantment.";
const REPOSE = "Gentle Repose — Exile target card from a graveyard.";

export default defineCard({
  name: "Dawnbringer Cleric",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: `${ETB_TEXT}\n• ${CURE}\n• ${DISPEL}\n• ${REPOSE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: CURE, effect: { kind: "gain-life", amount: 2 } },
          { text: DISPEL, targets: ["enchantment"], effect: { kind: "destroy", target: 0 } },
          { text: REPOSE, targets: [{ kind: "card-in-graveyard" }], effect: { kind: "exile", target: 0 } },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${CURE} ${DISPEL} ${REPOSE}`,
    },
  ],
});
