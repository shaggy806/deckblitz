import { defineCard } from "../define.js";

// Playtest card (Mystery Booster). Its rulings: a land that becomes a Swamp
// loses its other land types and rules-text abilities and has "{T}: Add {B}"
// (rule 305.7); with both target lands illegal the trigger doesn't resolve
// and the Titan stays in the graveyard. Two different lands (one "target").

const DIES_TEXT = "When Cyclopean Titan dies, two target lands become Swamps. Exile Cyclopean Titan.";
const TAP_TEXT = "{3}, {T}: Tap target creature, then return Cyclopean Titan to its owner's hand.";

export default defineCard({
  name: "Cyclopean Titan",
  manaCost: "{4}{B}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 8,
  toughness: 4,
  text: `${DIES_TEXT}\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "return-to-hand", target: "source" },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "any-number", of: "land", min: 2, max: 2 }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            effect: { kind: "become", target: 0, setSubtypes: ["Swamp"], duration: "permanent" },
            simultaneous: true,
          },
          { kind: "exile", target: "trigger-object" },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
