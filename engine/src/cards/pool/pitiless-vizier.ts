import { defineCard } from "../define.js";

// Amonkhet. Grisly Survivor's per-card discard trigger.
const TEXT = "Whenever you cycle or discard a card, this creature gains indestructible until end of turn.";

export default defineCard({
  name: "Pitiless Vizier",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Minotaur", "Cleric"],
  power: 4,
  toughness: 2,
  text: `${TEXT} (Damage and effects that say "destroy" don't destroy it. If its toughness is 0 or less, it still dies.)`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
