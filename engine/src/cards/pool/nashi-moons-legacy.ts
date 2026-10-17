import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 19031.
//
// Rulings:
//   [2023-05-12] If you don't want to cast the copy, you can choose not to; the copy ceases to
//     exist the next time state-based actions are performed.
//   [2023-05-12] You cast the copy while the ability is resolving and still on the stack. You
//     can't wait to cast it later in the turn.
//   [2023-05-12] Because you're paying the spell's costs, if the spell has {X} in its mana cost,
//     you may choose its value as normal.
//
// Kaervek, the Punisher's shape: the copy is made in exile and cast there as the trigger
// resolves, paying its costs (X chosen as normal); one not cast ceases to exist, and a
// permanent spell's copy becomes a token.

const ATTACK_TEXT =
  "Whenever Nashi attacks, exile up to one target legendary or Rat card from your graveyard and copy it. You may cast the copy.";

export default defineCard({
  name: "Nashi, Moon's Legacy",
  manaCost: "{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rat", "Shaman"],
  power: 3,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace, ward {1}\n${ATTACK_TEXT} (You still pay its costs. A copy of a permanent spell becomes a token.)`,
  triggered: [
    ward({ mana: "{1}" }),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { anyOf: [{ supertype: "legendary" }, { subtype: "Rat" }] },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "cast-now", from: "exiled-this-way", copies: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
