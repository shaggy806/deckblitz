import { defineCard } from "../define.js";

export default defineCard({
  name: "Gravebane Zombie",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 2,
  text: "If this creature would die, put it on top of its owner's library instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "library-top", self: true, from: "battlefield" },
      text: "If this creature would die, put it on top of its owner's library instead.",
    },
  ],
});
