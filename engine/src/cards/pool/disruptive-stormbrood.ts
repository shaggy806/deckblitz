import { defineCard } from "../define.js";

// EDHREC rank 11792.
//
// Rulings:
//   [2025-04-04] If an Omen spell is copied, that copy is also an Omen and is shuffled into its
//     owner’s library as it resolves. Its owner still shuffles their library, but the copy ceases
//     to exist as a state-based action.
//   [2025-04-04] If an Omen spell has one or more targets and all of those targets are illegal
//     when the spell tries to resolve, it won’t resolve. None of its effects will happen, and it
//     will be put into its owner’s graveyard. It won’t be shuffled into its owner’s library.
//   [2025-04-04] If the target creature’s power becomes greater than 3 before Petty Revenge
//     resolves, the target is illegal and the spell is put into its owner’s graveyard.
//   [2025-04-04] An omen card is a creature card in every zone except the stack, as well as while
//     on the stack if not cast as an Omen. Ignore its alternative characteristics in those cases.

const ETB_TEXT = "When this creature enters, destroy up to one target artifact or enchantment.";

export default defineCard({
  name: "Disruptive Stormbrood",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "artifact-or-enchantment" }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  faces: ["Disruptive Stormbrood", "Petty Revenge"],
  omen: true,
});
