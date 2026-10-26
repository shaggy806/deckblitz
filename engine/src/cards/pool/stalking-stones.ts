import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Tempest (TMP). EDHREC rank 17802. Soulstone Sanctuary's self-animation,
// adding artifact and Elemental; it lasts indefinitely.
//
// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn.
//   [2009-10-01] Activating the ability that turns it into a creature while it's already a
//     creature will override any effects that set its power and/or toughness to a specific number.
//     However, any effect that raises or lowers power and/or toughness will continue to apply.

const ANIMATE_TEXT =
  "{6}: This land becomes a 3/3 Elemental artifact creature that's still a land. (This effect lasts indefinitely.)";

export default defineCard({
  name: "Stalking Stones",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${ANIMATE_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Elemental"],
        duration: "permanent",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
