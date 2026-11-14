import { defineCard } from "../define.js";

// EDHREC rank 7916.
//
// "When you do": the reflexive ability triggers once for every two quest
// counters actually placed this way (the ruling) — twice under Doubling
// Season, never if fewer than two went on (`times`, over `thisWay:
// "counters-placed"`). Its target, up to one creature, is chosen as it goes on
// the stack (rule 603.12). The amount is the quest counters on Craig Boone as
// it resolves, or as it last existed on the battlefield (rule 608.2h, the
// ruling). The creature's controller chooses: Craig Boone deals that much
// damage to them, or to the creature (Blazing Salvo's shape).
//
// Rulings:
//   [2024-03-08] If Craig Boone is no longer on the battlefield when the reflexive triggered ability
//     resolves, use the number of quest counters that were on it when it was last on the battlefield
//     to determine how much damage it deals.
//   [2024-03-08] You don't choose a target for Craig Boone's last ability at the time it triggers.
//     Rather, a second "reflexive" ability triggers when you put two quest counters on Craig Boone
//     this way. You choose up to one target for that ability as it goes on the stack. Each player may
//     respond to this triggered ability as normal.
//   [2024-03-08] In the rare case where more than two quest counters are placed on Craig Boone
//     because of the effect of its last ability (for example, because of the effect of Doubling
//     Season), the reflexive triggered ability will trigger once for every two quest counters placed
//     on Craig Boone this way.

const REFLEXIVE_TEXT =
  "When you do, Craig Boone deals damage equal to the number of quest counters on it to up to one target creature unless that creature's controller has Craig Boone deal that much damage to them.";
const ATTACK_TEXT = `One for My Baby — Whenever you attack with two or more creatures, put two quest counters on Craig Boone. ${REFLEXIVE_TEXT}`;
const QUEST = { countersOn: "source", counter: "quest" } as const;

export default defineCard({
  name: "Craig Boone, Novac Guard",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["reach", "lifelink"],
  text: `Reach, lifelink\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "quest", amount: 2 },
          {
            kind: "reflexive-trigger",
            times: { half: { thisWay: "counters-placed" }, round: "down" },
            targets: [{ kind: "optional", of: "creature" }],
            effect: {
              kind: "each-player-may",
              who: { controllerOf: 0 },
              choices: [
                {
                  text: "Have Craig Boone deal that much damage to you.",
                  effect: { kind: "damage", amount: QUEST, who: "that-player" },
                },
                {
                  text: "Let Craig Boone deal that much damage to the creature.",
                  effect: { kind: "damage", amount: QUEST, target: 0 },
                },
              ],
            },
            text: REFLEXIVE_TEXT,
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
