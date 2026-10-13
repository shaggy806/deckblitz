import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 570.
//
// The {4} ability is activated from the hand (`zone: "hand"`), the card
// staying there until it resolves — revealed as it does (the ruling) — and
// put onto the battlefield then only if it's still the same card in the same
// hand (rule 400.7); entering, its own trigger phases up to one creature out
// (rule 702.26) until its controller's next untap step.
const ETB = "When this land enters, up to one target creature phases out.";
const TAP_C = "{T}: Add {C}.";
const TAP_ANY = "{1}, {T}: Add one mana of any color.";
const FROM_HAND = "{4}: Put this card from your hand onto the battlefield.";

export default defineCard({
  name: "Talon Gates of Madara",
  types: ["land"],
  subtypes: ["Gate"],
  text: `${ETB}\n${TAP_C}\n${TAP_ANY}\n${FROM_HAND}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "phase-out", target: 0 },
      resolve: null,
      text: ETB,
    },
  ],
  activated: [
    addManaAbility({ mana: "C", text: TAP_C }),
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: TAP_ANY,
    },
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: FROM_HAND,
      zone: "hand",
      staysInZone: true,
    },
  ],
});
