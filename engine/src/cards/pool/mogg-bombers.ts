import { defineCard } from "../define.js";

// EDHREC rank 28970.
//
// Rulings:
//   [2004-10-04] The Mogg Bombers do trigger on any creatures that enter at the same time they do.
//   [2011-01-25] The damage is dealt whether or not you sacrifice the Mogg Bombers. For instance,
//     if Mogg Bombers is destroyed or sacrificed in between the time when the ability triggers and
//     when it resolves, then the targeted player will still be dealt 3 damage.
//   [2011-01-25] If multiple creatures enter at the same time, the ability triggers once for each
//     of them. You may choose a different target player or planeswalker for each time it triggers.
//
// A `sequence`, not `sacrifice-source`'s `then`: the damage doesn't wait on
// the sacrifice, and "it" deals it as it last existed (rule 608.2h).

const TEXT =
  "When another creature enters, sacrifice this creature and it deals 3 damage to target player or planeswalker.";

export default defineCard({
  name: "Mogg Bombers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          { kind: "damage", amount: 3, target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
