import { defineCard } from "../define.js";

// EDHREC rank 29710.

export default defineCard({
  name: "Zhou Yu, Chief Commander",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 8,
  toughness: 8,
  text: "Zhou Yu can't attack unless defending player controls an Island.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { subtype: "Island" } } }],
      text: "Zhou Yu can't attack unless defending player controls an Island.",
    },
  ],
});
