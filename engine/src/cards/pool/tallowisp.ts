import { defineCard } from "../define.js";

// EDHREC rank 25817. "An Aura card with enchant creature" is the Aura's own
// enchant ability, exactly "Enchant creature" (`enchantAbility`).

const TEXT =
  "Whenever you cast a Spirit or Arcane spell, you may search your library for an Aura card with enchant creature, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Tallowisp",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Aura card with enchant creature?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Aura", enchantAbility: "creature" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
