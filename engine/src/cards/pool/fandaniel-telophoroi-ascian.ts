import { defineCard } from "../define.js";

// Final Fantasy. The opponents choose in turn order, then sacrifice at once
// (rule 101.4, its ruling); the life is counted from Fandaniel's controller's
// graveyard as each opponent's loss applies.
const END_TEXT =
  "At the beginning of your end step, each opponent may sacrifice a nontoken creature of their choice. Each opponent who doesn't loses 2 life for each instant and sorcery card in your graveyard.";

export default defineCard({
  name: "Fandaniel, Telophoroi Ascian",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Wizard"],
  power: 4,
  toughness: 5,
  text: `Whenever you cast an instant or sorcery spell, surveil 1.\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, surveil 1.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [{ sacrifice: { type: "creature", token: false }, text: "Sacrifice a nontoken creature" }],
        ifDidnt: {
          kind: "lose-life",
          amount: { product: [{ countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } }, 2] },
          who: "that-player",
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
