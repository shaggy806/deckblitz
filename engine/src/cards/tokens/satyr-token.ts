import { defineCard } from "../define.js";

/** 1/1 red Satyr that can't block — Anax, Hardened in the Forge's token. */
export default defineCard({
  name: "Satyr Token",
  art: "49bdae00-bcbd-4238-87d6-7e12ff7ffd83",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Satyr"],
  power: 1,
  toughness: 1,
  text: "This creature can't block.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
