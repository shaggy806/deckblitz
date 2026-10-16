import { defineCard } from "../define.js";

// EDHREC rank 13615.
//
// Rulings:
//   [2026-06-29] Excess damage has been dealt to a creature if the damage dealt to it is greater
//     than lethal damage. Usually, this means damage greater than its toughness, although damage
//     already marked on the creature is taken into account.
//   [2026-06-29] The sacrificed creature's last known existence on the battlefield is checked to
//     determine its power.
//   [2026-06-29] Bolg of the North's damage-dealing ability triggers only when you sacrifice a
//     creature as a result of the instruction of its triggered ability.
//   [2026-06-29] Bolg of the North has a reflexive triggered ability. When it enters the
//     battlefield, its triggered ability goes on the stack without a target. While that ability is
//     resolving, you may sacrifice another creature. If you do, a second ability triggers and you
//     pick a target that will be dealt damage.
//   [2026-06-29] To amass Goblins N, if you don't control an Army creature, create a 0/0 black
//     Goblin Army creature token. Then you choose an Army creature you control and put N +1/+1
//     counters on it. If that Army isn't already a Goblin, it becomes a Goblin in addition to its
//     other types.
//   [2026-06-29] You can't sacrifice multiple creatures to deal damage multiple times.
//
// Ziatora, the Incinerator's shape: the sacrifice is the enters ability's
// "may" (`exceptSource`: another creature), and "when you do" is a
// reflexive ability (rule 603.12) carrying the sacrificed creature's power
// as it last existed. Its target is another creature than Bolg. The amass
// is only when excess damage was dealt (rule 120.4a — past lethal damage,
// damage already marked counted), X being that excess
// (`excessDamageThisWay`, Hell to Pay).

const TEXT =
  "When Bolg enters, you may sacrifice another creature. When you do, Bolg deals damage equal to that creature's power to another target creature. If excess damage was dealt this way, amass Goblins X, where X is that excess damage.";
const REFLEXIVE_TEXT =
  "When you do, Bolg deals damage equal to that creature's power to another target creature. If excess damage was dealt this way, amass Goblins X, where X is that excess damage.";

export default defineCard({
  name: "Bolg of the North",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 5,
  toughness: 5,
  text: `${TEXT} (Put X +1/+1 counters on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [{ kind: "other", of: "creature" }],
          value: { powerOf: "sacrificed" },
          effect: {
            kind: "sequence",
            effects: [
              { kind: "damage", target: 0, amount: { triggerValue: true } },
              {
                kind: "conditional",
                condition: { kind: "excess-damage-this-way" },
                then: { kind: "amass", amount: { excessDamageThisWay: true }, creatureType: "Goblin" },
              },
            ],
          },
          text: REFLEXIVE_TEXT,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
