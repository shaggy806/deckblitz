import { defineCard } from "../define.js";

// EDHREC rank 10726.
//
// Split makes two tokens named Blue Horror (`tokens/blue-horror.ts`, keyed by
// that name like Cadet: no card is called Blue Horror).

const FLAMES_TEXT =
  "Coruscating Flames — Whenever you cast an instant or sorcery spell, this creature deals 2 damage to any target.";
const SPLIT_TEXT =
  'Split — When this creature dies, create two 2/2 blue and red Demon Horror creature tokens named Blue Horror with "Whenever you cast an instant or sorcery spell, this token deals 1 damage to any target."';

export default defineCard({
  name: "Pink Horror",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Demon", "Horror"],
  power: 4,
  toughness: 4,
  text: `${FLAMES_TEXT}\n${SPLIT_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: FLAMES_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blue Horror", count: 2 },
      resolve: null,
      text: SPLIT_TEXT,
    },
  ],
});
