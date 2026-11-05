import { defineCard } from "../define.js";

const COST_TEXT = "Instant and sorcery spells you cast cost {1} less to cast.";
const FLIP_TEXT =
  "Whenever you cast an instant or sorcery spell during your turn, flip a coin. If you lose the flip, Ral deals 1 damage to you. If you win the flip, you may exile Ral. If you do, return him to the battlefield transformed under his owner's control.";

/** The won flip's "exile, then return transformed" is a `flicker` with
 * `transformed` (Jecht, Reluctant Guardian's shape); the back face enters
 * with its extra loyalty from its own replacement. */
export default defineCard({
  name: "Ral, Monsoon Mage",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${COST_TEXT}\n${FLIP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["instant", "sorcery"] }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      condition: { kind: "your-turn" },
      targets: [],
      effect: {
        kind: "flip-coin",
        lost: { kind: "damage", amount: 1, who: "you" },
        won: {
          kind: "may",
          prompt: "Exile Ral, then return him transformed?",
          effect: { kind: "flicker", target: "source", transformed: true },
        },
      },
      resolve: null,
      text: FLIP_TEXT,
    },
  ],
  faces: ["Ral, Monsoon Mage", "Ral, Leyline Prodigy"],
  transform: true,
});
