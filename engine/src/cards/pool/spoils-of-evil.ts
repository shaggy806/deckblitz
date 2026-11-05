import { defineCard } from "../define.js";

const CARDS = {
  countInGraveyard: { typesAnyOf: ["artifact", "creature"], ownedBy: "you" },
  forTarget: 0,
} as const;

export default defineCard({
  name: "Spoils of Evil",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "For each artifact or creature card in target opponent's graveyard, add {C} and you gain 1 life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-mana", mana: "C", amount: CARDS },
      { kind: "gain-life", amount: CARDS },
    ],
  },
});
