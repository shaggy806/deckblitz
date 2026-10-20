import { defineCard } from "../define.js";

// EDHREC rank 9035.
//
// Rulings:
//   [2022-02-18] If you target both a player and a creature as you activate the ability, and one
//     of the targets is illegal as the ability resolves, Dragonspark Reactor will deal damage to
//     the remaining legal target. If both targets are illegal, the ability won't resolve.
//   [2022-02-18] Targeting a creature is optional, but you must choose at least one target player
//     to activate Dragonspark Reactor's last ability.
//
// "This artifact or another artifact you control enters" is one artifact
// enters-trigger with no `otherOnly`, so it sees itself too. The sacrifice
// ability counts the charge counters the Reactor had as it was sacrificed
// (Hoarder's Overflow's last-known read, rule 608.2h); the two damage
// instructions are one event (Way of the Warlord's shape).
const CHARGE_TEXT =
  "Whenever this artifact or another artifact you control enters, put a charge counter on this artifact.";
const SAC_TEXT =
  "{4}, Sacrifice this artifact: It deals damage equal to the number of charge counters on it to target player and that much damage to up to one target creature.";

export default defineCard({
  name: "Dragonspark Reactor",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${CHARGE_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false, sacrifice: "self" },
      targets: ["player", { kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", target: 0, amount: { countersOn: "source", counter: "charge" } },
          { kind: "damage", target: 1, amount: { countersOn: "source", counter: "charge" } },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
