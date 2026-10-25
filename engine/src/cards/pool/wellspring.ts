import { defineCard } from "../define.js";

// Mirage. EDHREC rank 26351.
//
// Rulings:
//   [2004-10-04] If Wellspring leaves the battlefield, the control effect still lasts until end of
//     turn.
//
// Both abilities act on the enchanted land (`"attached"`), not a target; each control change
// is a plain until-end-of-turn effect, so it outlives the Aura (the ruling).

export default defineCard({
  name: "Wellspring",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nWhen this Aura enters, gain control of enchanted land until end of turn.\nAt the beginning of your upkeep, untap enchanted land. You gain control of that land until end of turn.",
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-control", target: "attached", untilEndOfTurn: true },
      resolve: null,
      text: "When this Aura enters, gain control of enchanted land until end of turn.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "attached" },
          { kind: "gain-control", target: "attached", untilEndOfTurn: true },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, untap enchanted land. You gain control of that land until end of turn.",
    },
  ],
});
