import { defineCard } from "../define.js";

const TEXT = "Whenever you commit a crime during your turn, this creature gains indestructible until end of turn.";

// "During your turn" can't change while the trigger waits (rule 603.4).
export default defineCard({
  name: "Overzealous Muscle",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Mercenary"],
  power: 5,
  toughness: 4,
  text: `${TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime. Damage and effects that say "destroy" don't destroy a creature with indestructible.)`,
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      condition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
