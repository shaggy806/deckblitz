import { defineCard } from "../define.js";

const TEXT = "You can't cast creature spells.";

export default defineCard({
  name: "Steel Golem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 4,
  text: TEXT,
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "cast", who: "you", filter: { type: "creature" } }], text: TEXT }],
});
