import { defineCard } from "../define.js";

// EDHREC rank 15451. "Heliod's Punishment" in the granted ability is the Aura
// that grants it (rule 201.5a): `remove-counter` and `destroy` of
// `"granter"`, its counters read as it last existed once it's gone (608.2h),
// acted on only while it's still that permanent (400.7). The loss and the
// grant are one static, the loss first as the text reads (layer 6, rule
// 613.7), so the creature keeps an ability gained after it was enchanted, and
// under two Heliod's Punishments has only the activated ability of the one
// attached last (the rulings). A characteristic-defining ability is lost too,
// so a * in its power or toughness is 0 (the ruling).

const ENTERS = "This Aura enters with four task counters on it.";
const GRANTED =
  "{T}: Remove a task counter from Heliod's Punishment. Then if it has no task counters on it, destroy Heliod's Punishment.";
const STATIC = `Enchanted creature can't attack or block. It loses all abilities and has "${GRANTED}"`;

export default defineCard({
  name: "Heliod's Punishment",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS}\n${STATIC}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "task", amount: 4 } },
      text: ENTERS,
    },
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      loseAllAbilities: true,
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "remove-counter", target: "granter", counter: "task", amount: 1 },
              {
                kind: "conditional",
                condition: { kind: "amounts", left: { countersOn: "granter", counter: "task" }, op: "eq", right: 0 },
                then: { kind: "destroy", target: "granter" },
              },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STATIC,
    },
  ],
});
