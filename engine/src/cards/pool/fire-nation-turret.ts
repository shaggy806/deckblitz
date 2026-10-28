import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

const COMBAT_TEXT =
  "At the beginning of combat on your turn, up to one target creature gets +2/+0 and gains firebending 2 until end of turn.";

export default defineCard({
  name: "Fire Nation Turret",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${COMBAT_TEXT}\n{R}: Put a charge counter on this artifact.\nRemove fifty charge counters from this artifact: It deals 50 damage to any target.`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{R}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 50 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 50, target: 0 },
      resolve: null,
      text: "Remove fifty charge counters from this artifact: It deals 50 damage to any target.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-triggered", target: 0, ability: firebending(2), duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
