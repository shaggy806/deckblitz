import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

// EDHREC rank 7796.
//
// Rulings:
//   [2023-11-10] Once persist returns the creature, it's considered a new object with no relation
//     to the object that it was. Auras that were attached to it won't return to the battlefield.
//     Equipment that was attached to it will remain unattached. Any counters that were on it won't
//     be put on the new creature.
//   [2023-11-10] If a creature with persist that has +1/+1 counters on it receives enough -1/-1
//     counters to cause it to be destroyed by lethal damage or put into its owner's graveyard for
//     having 0 or less toughness, persist won't trigger and the card won't return to the
//     battlefield. That's because persist checks the creature as it last existed on the
//     battlefield, and it still had -1/-1 counters on it at that point.
//   [2023-11-10] If a card with persist is removed from the graveyard after it dies but before the
//     ability trigger resolves, it won't be returned to the battlefield.
//   [2023-11-10] If a creature has +1/+1 counters and -1/-1 counters on it, state-based actions
//     remove the same number of each so that it has only one kind of those counters on it. A
//     creature's persist ability can bring it back again if its -1/-1 counters are removed this
//     way.

// Cauldron of Souls' granted persist, over every nontoken Vampire creature
// its controller controls as the ability resolves (rule 611.2c — one
// entering later doesn't gain it).
const ACTIVATED_TEXT =
  "{1}{B}, Sacrifice this creature: Each nontoken Vampire creature you control gains persist until end of turn. (When it dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)";

export default defineCard({
  name: "Dusk Legion Sergeant",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${ACTIVATED_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "grant-triggered-all",
        filter: { type: "creature", subtype: "Vampire", controlledBy: "you", token: false },
        ability: persist(),
        duration: "end-of-turn",
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
