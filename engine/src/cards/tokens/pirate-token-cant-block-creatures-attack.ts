import { defineCard } from "../define.js";

/** 1/1 red Pirate with "This token can't block" and "Creatures you control
 * attack each combat if able." — Pursued Whale's token. */
export default defineCard({
  name: "Pirate Token (Can't Block, Creatures Attack)",
  art: "42248cea-29e8-4ebe-ad64-e87e216b55d6",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Pirate"],
  power: 1,
  toughness: 1,
  text: "This token can't block.\nCreatures you control attack each combat if able.",
  static: [
    { affects: { scope: "self" }, restrictions: ["cant-block"], text: "This token can't block." },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      restrictions: ["must-attack"],
      text: "Creatures you control attack each combat if able.",
    },
  ],
});
