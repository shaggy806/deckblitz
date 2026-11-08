import { defineCard } from "../define.js";

const TEXT = "If a creature you control attacks, this creature also attacks if able.";

export default defineCard({
  name: "Ekundu Cyclops",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 3,
  toughness: 4,
  text: TEXT,
  static: [
    { affects: { scope: "self" }, restrictions: [{ kind: "must-attack", ifAttacks: { type: "creature", controlledBy: "you" } }], text: TEXT },
  ],
});
