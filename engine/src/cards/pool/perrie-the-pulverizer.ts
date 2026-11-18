import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";

// EDHREC rank 16833.
//
// Rulings:
//   [2022-04-29] If a permanent that would be dealt damage has more than one shield counter on it,
//     that damage is prevented and only one shield counter is removed.
//   [2022-04-29] If a permanent with a shield counter is dealt unpreventable damage, that damage
//     will be dealt and a shield counter will still be removed.
//   [2022-04-29] Removing a shield counter in this way isn't the same as regenerating a creature.
//   [2022-04-29] A creature with a shield counter on it may still be destroyed by state-based
//     actions if it has damage marked on it equal to its toughness or has been dealt unpreventable
//     damage by a source with deathtouch.
//   [2022-04-29] Shield counters don't prevent players from sacrificing creatures.
//   [2022-04-29] “Shield” is not an ability that creatures have and shield counters are not
//     keyword counters. If a creature with a shield counter loses its abilities, the shield
//     counter will still protect it as normal.
//
// X is counted once, as the attack trigger resolves (rule 608.2h): each kind
// of counter (rule 122.1) on any permanent you control, however many of it.

const ENTERS_TEXT =
  "When Perrie enters, put a shield counter on target creature. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)";
const ATTACKS_TEXT =
  "Whenever Perrie attacks, target creature you control gains trample and gets +X/+X until end of turn, where X is the number of different kinds of counters among permanents you control.";

const COUNTER_KINDS: EffectAmount = { aggregate: "distinct", of: "counter-kind", filter: { controlledBy: "you" } };

export default defineCard({
  name: "Perrie, the Pulverizer",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rhino", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${ENTERS_TEXT}\n${ATTACKS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "shield", amount: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          { kind: "modify-pt", target: 0, power: COUNTER_KINDS, toughness: COUNTER_KINDS, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACKS_TEXT,
    },
  ],
});
