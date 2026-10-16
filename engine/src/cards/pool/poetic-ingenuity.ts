import { defineCard } from "../define.js";

// EDHREC rank 8084.
//
// Rulings:
//   [2023-11-10] Poetic Ingenuity's last ability resolves before the spell that caused it to
//     trigger. You create a Dinosaur token even if the artifact spell is countered.
//
// The Ur-Dragon's batched attack trigger (once per declaration, the number of
// Dinosaurs that attacked as its value) and Glóin's once-each-turn cast
// trigger.
const ATTACK_TEXT = "Whenever one or more Dinosaurs you control attack, create that many Treasure tokens.";
const CAST_TEXT =
  "Whenever you cast an artifact spell, create a 3/1 red Dinosaur creature token. This ability triggers only once each turn.";

export default defineCard({
  name: "Poetic Ingenuity",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ATTACK_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you", filter: { subtype: "Dinosaur", controlledBy: "you" } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: { triggerValue: true } },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "3/1 Dinosaur Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
