import { defineCard } from "../define.js";

export default defineCard({
  name: "Mindless Null",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: "This creature can't block unless you control a Vampire.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Vampire" }, atLeast: 1, countsSelf: true } },
      restrictions: ["cant-block"],
      text: "This creature can't block unless you control a Vampire.",
    },
  ],
});
