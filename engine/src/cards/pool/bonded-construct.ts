import { defineCard } from "../define.js";

const TEXT = "This creature can't attack alone.";

export default defineCard({
  name: "Bonded Construct",
  manaCost: "{1}",
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-attack-alone"], text: TEXT }],
});
