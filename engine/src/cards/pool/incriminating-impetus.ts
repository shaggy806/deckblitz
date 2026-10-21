import { defineCard } from "../define.js";

const SUSPECT_TEXT = "When this Aura enters, suspect enchanted creature. (It has menace and can't block.)";
const GOAD_TEXT =
  "Enchanted creature gets +2/+2 and is goaded. (It attacks each combat if able and attacks a player other than you if able.)";

export default defineCard({
  name: "Incriminating Impetus",
  manaCost: "{2}{B/R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${SUSPECT_TEXT}\n${GOAD_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "suspect", target: "attached" },
      resolve: null,
      text: SUSPECT_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], goads: true, text: GOAD_TEXT }],
});
