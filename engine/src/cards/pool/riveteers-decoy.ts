import { defineCard } from "../define.js";

const BLITZ_TEXT =
  'Blitz {3}{G} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

export default defineCard({
  name: "Riveteers Decoy",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: `This creature must be blocked if able.\n${BLITZ_TEXT}`,
  blitz: { cost: "{3}{G}" },
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked-if-able"],
      text: "This creature must be blocked if able.",
    },
  ],
});
