import { defineCard } from "../define.js";

// Spells, not cards (the ruling): an enchantment's ability is unaffected, and so
// is an instant's own ability from a graveyard.

const TEXT = "{W}, {T}: Target permanent you control gains protection from instant spells and from sorcery spells until end of turn.";

export default defineCard({
  name: "Devoted Caretaker",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "permanent", filter: { controlledBy: "you" } }],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { filter: { anyOf: [{ isSpell: true, type: "instant" }, { isSpell: true, type: "sorcery" }] } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
