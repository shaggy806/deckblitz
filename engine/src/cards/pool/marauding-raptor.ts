import { defineCard } from "../define.js";

// The damage was dealt this way (a prevented 2 doesn't count) to the one
// creature that entered; whether that creature is a Dinosaur is read as it last
// existed, since 2 damage may have killed it.
const COST_TEXT = "Creature spells you cast cost {1} less to cast.";
const ENTER_TEXT =
  "Whenever another creature you control enters, this creature deals 2 damage to it. If a Dinosaur is dealt damage this way, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Marauding Raptor",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 3,
  text: `${COST_TEXT}\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature" }, reduceGeneric: 1, when: { caster: "you" } },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: "trigger-object" },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "damage-dealt-this-way" },
                { kind: "object-matches", object: "trigger-object", filter: { subtype: "Dinosaur" } },
              ],
            },
            then: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
