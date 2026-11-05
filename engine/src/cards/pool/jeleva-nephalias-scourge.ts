import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When Jeleva enters, each player exiles the top X cards of their library, where X is the amount of mana spent to cast Jeleva.";
const ATTACK_TEXT =
  "Whenever Jeleva attacks, you may cast an instant or sorcery spell from among cards exiled with Jeleva without paying its mana cost.";

export default defineCard({
  name: "Jeleva, Nephalia's Scourge",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "exile-from-library",
        whose: "each-player",
        amount: { manaSpentOf: "source" },
        linked: true,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "exiled-with-source",
        spell: { typesAnyOf: ["instant", "sorcery"] },
        free: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
