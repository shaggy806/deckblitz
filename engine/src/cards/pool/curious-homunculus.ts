import { defineCard } from "../define.js";

// EDHREC rank 9553. The transform is an intervening-if (rule 603.4): checked
// as the upkeep begins and again as it resolves (the first ruling).
const MANA_TEXT = "{T}: Add {C}. Spend this mana only to cast an instant or sorcery spell.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if there are three or more instant and/or sorcery cards in your graveyard, transform this creature.";

export default defineCard({
  name: "Curious Homunculus",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 1,
  text: `${MANA_TEXT}\n${UPKEEP_TEXT}`,
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
      condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Curious Homunculus", "Voracious Reader"],
  transform: true,
});
