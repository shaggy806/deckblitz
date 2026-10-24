import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add {C}. Spend this mana only to cast an instant or sorcery spell.";
const TRANSFORM_TEXT =
  "At the beginning of your upkeep, if there are three or more instant and/or sorcery cards in your graveyard, transform this creature.";

export default defineCard({
  name: "Curious Homunculus",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 1,
  text: `${MANA_TEXT}\n${TRANSFORM_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast an instant or sorcery spell.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      // Intervening-if (rule 603.4): checked as the upkeep begins and again
      // as it resolves (the ruling).
      condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Curious Homunculus", "Voracious Reader"],
  transform: true,
});
