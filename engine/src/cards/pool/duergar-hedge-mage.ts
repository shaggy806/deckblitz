import { defineCard } from "../define.js";

// EDHREC rank 8551.
//
// Rulings:
//   [2008-08-01] Each of the triggered abilities has an "intervening 'if' clause": it won't
//     trigger unless you control two or more lands of the type, and does nothing if you don't by
//     the time it resolves.
//   [2008-08-01] Both abilities are optional; you choose whether to use them when they resolve. If
//     an ability has a target, you must choose a target even if you don't plan to use the ability.
//   [2008-08-01] Each of the triggered abilities look at your lands individually.

const MOUNTAIN_TEXT =
  "When this creature enters, if you control two or more Mountains, you may destroy target artifact.";
const PLAINS_TEXT =
  "When this creature enters, if you control two or more Plains, you may destroy target enchantment.";

export default defineCard({
  name: "Duergar Hedge-Mage",
  manaCost: "{2}{R/W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Shaman"],
  power: 2,
  toughness: 2,
  text: `${MOUNTAIN_TEXT}\n${PLAINS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Mountain" }, atLeast: 2 },
      targets: ["artifact"],
      effect: { kind: "may", prompt: "Destroy target artifact?", effect: { kind: "destroy", target: 0 } },
      resolve: null,
      text: MOUNTAIN_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 2 },
      targets: ["enchantment"],
      effect: { kind: "may", prompt: "Destroy target enchantment?", effect: { kind: "destroy", target: 0 } },
      resolve: null,
      text: PLAINS_TEXT,
    },
  ],
});
