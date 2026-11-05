import { defineCard } from "../define.js";

// EDHREC rank 8219.
//
// Rulings:
//   [2025-02-14] The Motherlode's reflexive triggered ability prevents all creatures without
//     flying that player controls from blocking that turn, including creatures that lose flying
//     after the ability resolves as well as creatures without flying that enter the battlefield or
//     come under that player's control later in the turn.
//   [2025-02-14] Use the number of nonbasic lands the target opponent controls when The
//     Motherlode's first ability resolves to determine the number of energy counters you get.
//   [2025-02-14] You don't choose a target nonbasic land at the time The Motherlode's last ability
//     triggers. Rather, a second "reflexive" ability triggers when you pay {E}{E}{E}{E} this way.
//   [2025-02-14] If the target nonbasic land is an illegal target as The Motherlode's reflexive
//     triggered ability tries to resolve, it won't resolve and none of its effects happen.
//
// "Creatures that player controls without flying can't block this turn" is a
// turn-wide rule over the defending player's creatures (`restrict`'s
// `controlledByTarget` — the land must still be that player's as it
// resolves), so later arrivals and creatures that lose flying are bound too.
const ENTER_TEXT =
  "When The Motherlode enters, choose target opponent. You get an amount of {E} (energy counters) equal to the number of nonbasic lands that player controls.";
const ATTACK_TEXT =
  "Whenever The Motherlode attacks, you may pay {E}{E}{E}{E}. When you do, destroy target nonbasic land defending player controls, and creatures that player controls without flying can't block this turn.";

export default defineCard({
  name: "The Motherlode, Excavator",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 5,
  toughness: 5,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "get-energy",
        amount: { countOf: { type: "land", notSupertype: "basic", controlledBy: "you" }, forTarget: 0 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E}{E}{E}?",
        costEnergy: 4,
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "land", notSupertype: "basic" } }],
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "restrict",
                filter: { type: "creature", notKeyword: "flying", controlledBy: "you" },
                controlledByTarget: 0,
                restrictions: ["cant-block"],
              },
              { kind: "destroy", target: 0 },
            ],
          },
          text: "When you do, destroy target nonbasic land defending player controls, and creatures that player controls without flying can't block this turn.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
