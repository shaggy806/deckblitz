import { defineCard } from "../define.js";

// Rulings: if an effect transforms it on the battlefield instead, Strangling
// Grasp attaches to nothing and goes to the graveyard (rule 303.4d) — the
// engine's state-based actions do that. The return is put there "attached
// to" the target, so an illegal target leaves the card in the graveyard
// (rule 303.4i).
export default defineCard({
  name: "Vengeful Strangler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  text: "This creature can't block.\nWhen this creature dies, return it to the battlefield transformed under your control attached to target creature or planeswalker an opponent controls.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "put-onto-battlefield",
        target: "source",
        transformed: true,
        underYourControl: true,
        attachedTo: 0,
      },
      resolve: null,
      text: "When this creature dies, return it to the battlefield transformed under your control attached to target creature or planeswalker an opponent controls.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  faces: ["Vengeful Strangler", "Strangling Grasp"],
  transform: true,
});
