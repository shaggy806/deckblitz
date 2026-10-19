import { defineCard } from "../define.js";

// EDHREC rank 12913. Return the Favor's stack target (instants, sorceries,
// activated and triggered abilities) with a counter.

const ABOMINATION_TEXT =
  "Psychic Abomination — When this creature enters, counter target instant spell, sorcery spell, activated ability, or triggered ability.";

export default defineCard({
  name: "Sister of Silence",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${ABOMINATION_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "stack", spells: "instant-or-sorcery", abilities: true }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: ABOMINATION_TEXT,
    },
  ],
});
