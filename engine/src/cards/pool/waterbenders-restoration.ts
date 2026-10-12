import { defineCard } from "../define.js";

// EDHREC rank 6103.
//
// "Waterbend {X}" as an additional cost (rule 701.67a) makes it an {X} spell
// without an {X} in its mana cost (its mana value stays 2): X is announced,
// then exactly X targets (Curse of the Swine's group, rule 601.2b–c), and X
// of the total cost's generic may be paid by tapping artifacts and creatures —
// the creatures it exiles among them. Eerie Interlude's flicker: exiled
// together, back together at the next end step under their owners' control.

export default defineCard({
  name: "Waterbender's Restoration",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "As an additional cost to cast this spell, waterbend {X}. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)\nExile X target creatures you control. Return those cards to the battlefield under their owner's control at the beginning of the next end step.",
  additionalCost: { waterbend: "x" },
  targets: [{ kind: "any-number", of: "creature-you-control", min: "x", max: "x" }],
  effect: {
    kind: "flicker",
    target: { from: 0 },
    returnAt: "next-end-step",
    returnText: "Return the exiled cards to the battlefield under their owner's control.",
  },
});
