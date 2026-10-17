import { defineCard } from "../define.js";

// EDHREC rank 12805.
//
// Rulings:
//   [2023-10-13] You cast the spell as part of the resolution of Ryan's triggered ability. You
//     can't wait and cast the spell at a later time.
//   [2023-10-13] You may pay optional additional costs to cast that spell, such as kicker costs.
//     If it has any mandatory additional costs, you must pay those.
//   [2023-10-13] The Doctor's companion ability allows you to have two commanders if one has the
//     ability and the other is a legendary creature that is a Time Lord Doctor and has no other
//     creature types.
//
// Chaos Wand's reveal-until (exile until a nonland card, a free `cast-now`
// while this resolves, the rest — the found card too, if it wasn't cast — to
// the bottom in a random order) with Solstice Revelations' mana value gate
// on the spell, here against Ryan's power as the ability resolves (as it last
// existed, if Ryan has left).
const ATTACK_TEXT =
  "Whenever Ryan attacks, exile cards from the top of your library until you exile a nonland card. You may cast the exiled card without paying its mana cost if it's a spell with mana value less than or equal to Ryan's power. Put the exiled cards not cast this way on the bottom of your library in a random order.";

export default defineCard({
  name: "Ryan Sinclair",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  pairing: { kind: "doctors-companion" },
  text: `${ATTACK_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"] },
        exile: true,
        then: {
          kind: "cast-now",
          target: 0,
          free: true,
          spell: { manaValue: { op: "lte", n: { amount: { powerOf: "source" } } } },
        },
        rest: "bottom-random",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
