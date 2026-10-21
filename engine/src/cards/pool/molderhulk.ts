import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, return target land card from your graveyard to the battlefield.";

// Cast from a graveyard, it's on the stack as its cost is worked out, so it
// doesn't count itself (the ruling).
export default defineCard({
  name: "Molderhulk",
  manaCost: "{7}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Fungus", "Zombie"],
  power: 6,
  toughness: 6,
  text: `Undergrowth — This spell costs {1} less to cast for each creature card in your graveyard.\n${ETB_TEXT}`,
  selfCostReduction: {
    // Unconditional: the always-true gate Overwhelming Remorse uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { type: "creature" } },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "land" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
