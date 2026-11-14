import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 18514. Until end of turn the target is a Vehicle artifact and
// nothing else (its card types and subtypes go; supertypes stay — the
// ruling), its base P/T its mana value as the ability resolves, with crew 2
// and Crash Land beside the abilities it had. Crash Land triggers once per
// damage event, whatever it hit (the rulings); its target is chosen as it
// triggers, and the Vehicle is sacrificed before it deals the damage.
//
// Rulings:
//   [2022-10-07] The Vehicle will retain any abilities it previously had, as well as gaining crew
//     2 and the ability to crash into stuff.
//   [2022-10-07] The target of Rex Nebula's ability will become a Vehicle artifact until end of
//     turn. It will lose all of its previous card types and subtypes, but it will keep any
//     supertypes (such as legendary) it previously had. If the target of Rex Nebula's ability is a
//     creature, it will lose all creature types (such as Zombie) it had until end of turn, and
//     becoming crewed will not cause it to regain those subtypes.
//   [2022-10-07] The Crash Land ability will trigger whenever the Vehicle deals any damage, not
//     only combat damage.
//   [2022-10-07] The Crash Land ability will trigger once for each instance of damage, no matter
//     how many players or permanents the Vehicle deals damage to.
const CRASH_TEXT =
  "Crash Land — Whenever this Vehicle deals damage, roll a six-sided die. If the result is equal to this Vehicle's mana value, sacrifice this Vehicle, then it deals that much damage to any target.";
const COMBAT_TEXT = `At the beginning of combat on your turn, choose target nonland permanent you control. Until end of turn, it becomes a Vehicle artifact with base power and toughness each equal to its mana value, and it gains crew 2 and "${CRASH_TEXT}"`;

export default defineCard({
  name: "Captain Rex Nebula",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot", "Employee"],
  power: 2,
  toughness: 2,
  text: COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { notTypes: ["land"] } }],
      effect: {
        kind: "become",
        target: 0,
        setTypes: ["artifact"],
        setSubtypes: ["Vehicle"],
        power: { manaValueOf: 0 },
        toughness: { manaValueOf: 0 },
        activated: [crew(2)],
        triggered: [
          {
            trigger: { on: "deals-damage", who: "self" },
            targets: ["any-target"],
            effect: {
              kind: "roll-dice",
              sides: 6,
              then: {
                kind: "conditional",
                condition: { kind: "amounts", left: { roll: "total" }, op: "eq", right: { manaValueOf: "source" } },
                then: {
                  kind: "sequence",
                  effects: [
                    { kind: "sacrifice-source" },
                    { kind: "damage", amount: { roll: "total" }, target: 0 },
                  ],
                },
              },
            },
            resolve: null,
            text: CRASH_TEXT,
          },
        ],
        duration: "end-of-turn",
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
