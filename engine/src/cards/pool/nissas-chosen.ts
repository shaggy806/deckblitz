import { defineCard } from "../define.js";

const TEXT = "If this creature would die, put it on the bottom of its owner's library instead.";

export default defineCard({
  name: "Nissa's Chosen",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", self: true, from: "battlefield", instead: "library-bottom" },
      text: TEXT,
    },
  ],
});
