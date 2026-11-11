import { defineCard } from "../define.js";

// EDHREC rank 7843. Creature cards you own in exile and in your graveyard,
// each counted once, generic mana only.
export default defineCard({
  name: "Huskburster Swarm",
  manaCost: "{7}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental", "Insect"],
  power: 6,
  toughness: 6,
  keywords: ["menace", "deathtouch"],
  text: "This spell costs {1} less to cast for each creature card you own in exile and in your graveyard.\nMenace, deathtouch",
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { aggregate: "count", filter: { type: "creature", ownedBy: "you" }, in: ["graveyards", "exile"] },
  },
});
