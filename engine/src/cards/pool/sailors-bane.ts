import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

export default defineCard({
  name: "Sailors' Bane",
  manaCost: "{7}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon", "Turtle"],
  power: 7,
  toughness: 7,
  text: "This spell costs {1} less to cast for each card you own in exile and in your graveyard that's an instant card, a sorcery card, or a card that has an Adventure.\nWard {4} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {4}.)",
  selfCostReduction: {
    // Unconditional: the always-true gate `affinity` uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: {
      aggregate: "count",
      filter: { ownedBy: "you", anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { hasAdventure: true }] },
      in: ["graveyards", "exile"],
    },
  },
  triggered: [ward({ mana: "{4}" })],
});
