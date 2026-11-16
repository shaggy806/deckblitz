import { defineCard } from "../define.js";

// EDHREC rank 10706.
// "If Chandra has dealt 3 or more damage this turn" is asked as the ability
// resolves, after its own 1 damage: what this object dealt this turn in its
// stint on the battlefield (`damage-dealt-this-turn` with `bySelf`, read from
// the journal) — combat damage and damage to anything included, whoever
// controlled her as she dealt it.
//
// Rulings:
//   [2015-06-22] Chandra, Fire of Kaladesh's activated ability will count any damage Chandra has
//     dealt during the turn to any permanent or player, including combat damage.
//   [2015-06-22] The last sentence of Chandra, Fire of Kaladesh's activated ability isn't a
//     separate ability. The check happens only as that activated ability resolves. You must
//     activate the ability in order to exile Chandra and return her to the battlefield
//     transformed, even if Chandra has already dealt 3 or more damage during the turn.
//   [2015-06-22] A Magic Origins planeswalker that enters the battlefield because of the ability
//     of its front face will enter with loyalty counters as normal.

const UNTAP_TEXT = "Whenever you cast a red spell, untap Chandra.";
const PING_TEXT =
  "{T}: Chandra deals 1 damage to target player or planeswalker. If Chandra has dealt 3 or more damage this turn, exile her, then return her to the battlefield transformed under her owner's control.";

export default defineCard({
  name: "Chandra, Fire of Kaladesh",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: `${UNTAP_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          {
            kind: "conditional",
            condition: { kind: "damage-dealt-this-turn", who: "any-player", bySelf: true, atLeast: 3 },
            then: { kind: "flicker", target: "source", transformed: true },
          },
        ],
      },
      resolve: null,
      text: PING_TEXT,
    },
  ],
  faces: ["Chandra, Fire of Kaladesh", "Chandra, Roaring Flame"],
  transform: true,
});
