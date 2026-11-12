import { defineCard } from "../define.js";

const ETB_TEXT = "When this enchantment enters, target creature an opponent controls gets -3/-3 until end of turn.";
const STATIC_TEXT =
  "Creatures your opponents control can be the targets of spells and abilities as though they didn't have " +
  "hexproof. Ward abilities of those creatures don't trigger.";

export default defineCard({
  name: "Nowhere to Run",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      // Anyone's spells and abilities, not only yours.
      targetsIgnoringHexproof: { object: { type: "creature", controlledBy: "opponent" }, anyController: true },
      suppressWardTriggers: { type: "creature", controlledBy: "opponent" },
      text: STATIC_TEXT,
    },
  ],
});
