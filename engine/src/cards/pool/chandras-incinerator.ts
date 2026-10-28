import { defineCard } from "../define.js";

// EDHREC rank 2661.
//
// Rulings:
//   [2020-06-23] In a multiplayer game, Chandra's Incinerator counts damage dealt to opponents who
//     have lost the game.
//   [2020-06-23] Combat damage is the damage that's dealt automatically by attacking and blocking
//     creatures. Any other damage is noncombat damage, even if it's dealt during a combat phase by
//     an attacking or blocking creature.
//   [2020-06-23] Chandra's Incinerator counts all noncombat damage dealt to your opponents, not
//     the difference in their life totals since the turn began. For example, if an opponent was
//     dealt 5 noncombat damage but gained 3 life, Chandra's Incinerator still costs just {R}.
//   [2020-06-23] The cost reduction applies only to generic mana in the cost of Chandra's
//     Incinerator. It can't reduce the {R} requirement.
// The reduction sums every opponent's noncombat damage this turn, those who have lost\nincluded (the first ruling: the sum runs over the whole turn order).

const COST_TEXT =
  "This spell costs {X} less to cast, where X is the total amount of noncombat damage dealt to your opponents this turn.";
const DAMAGE_TEXT =
  "Whenever a source you control deals noncombat damage to an opponent, this creature deals that much damage to target creature or planeswalker that player controls.";

export default defineCard({
  name: "Chandra's Incinerator",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `${COST_TEXT}\nTrample\n${DAMAGE_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "noncombat-damage-taken", who: "opponent" },
  },
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", to: "opponent", combat: false },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
