import { defineCard } from "../define.js";

// EDHREC rank 13309.
//
// Rulings:
//   [2023-10-13] You may sacrifice only one creature to pay a spell's casualty cost, and you copy
//     the spell only once.
//   [2023-10-13] The copy of the spell is created on the stack, so it's not "cast." Abilities
//     that trigger when a player casts a spell won't trigger.
//   [2023-10-13] Casualty 2 means "As an additional cost to cast this spell, you may sacrifice a
//     creature with power 2 or greater." and "When you cast this spell, if a casualty cost was
//     paid for it, copy it. If the spell has any targets, you may choose new targets for the
//     copy."
//   [2023-10-13] If you pay the casualty cost of a spell, the copy will resolve before the
//     original spell.
//
// Anhelo, the Painter's grant with the filter swapped: "the first" counts
// every nonlegendary artifact spell cast this turn, ones cast before Ashad
// arrived included (`firstEachTurn`). The copy of a permanent spell resolves
// into a token (rule 707.10f). A creature sacrificed for the casualty is
// "another creature" sacrificed, so it also grows Ashad.

const CASUALTY_TEXT =
  "The first nonlegendary artifact spell you cast each turn has casualty 2. (As you cast it, you may sacrifice a creature with power 2 or greater. When you do, copy it. A copy of an artifact spell becomes a token.)";
const SACRIFICE_TEXT = "Whenever you sacrifice another creature, put a +1/+1 counter on Ashad.";

export default defineCard({
  name: "Ashad, the Lone Cyberman",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Cyberman"],
  power: 3,
  toughness: 3,
  text: `${CASUALTY_TEXT}\n${SACRIFICE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: {
        filter: { type: "artifact", notSupertype: "legendary" },
        firstEachTurn: true,
        casualty: 2,
      },
      text: CASUALTY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
