import { defineCard } from "../define.js";

// EDHREC rank 15272. The trigger's object is the Aura (`object:
// "attachment"`), so "that Aura's mana value" is `manaValueOf: "trigger-object"`
// in the filter on what it became attached to, and "that permanent" is the
// trigger's recipient. The control lasts while that Aura, in its stint, stays
// attached to it (rule 611.2b), and never begins if it has come off by the
// time the ability resolves (the ruling). An Aura entering attached becomes
// attached too.
//
// Rulings:
//   - If the Aura you control becomes unattached from a nonland permanent (most likely because the
//     Aura left the battlefield) before Eriette's triggered ability resolves, you won't gain control
//     of that nonland permanent at all.
//   - If the mana cost of a permanent includes {X}, X is 0 for the purpose of determining its mana
//     value.

const TRIGGER =
  "Whenever an Aura you control becomes attached to a nonland permanent an opponent controls with mana value less than or equal to that Aura's mana value, gain control of that permanent for as long as that Aura is attached to it.";

export default defineCard({
  name: "Eriette, the Beguiler",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Warlock"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${TRIGGER}`,
  triggered: [
    {
      trigger: {
        on: "becomes-attached",
        object: "attachment",
        attachment: { subtype: "Aura", controlledBy: "you" },
        filter: {
          notTypes: ["land"],
          controlledBy: "opponent",
          manaValue: { op: "lte", n: { amount: { manaValueOf: "trigger-object" } } },
        },
      },
      targets: [],
      effect: { kind: "gain-control", target: "trigger-recipient", untilEndOfTurn: false, whileAttached: "trigger-object" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
