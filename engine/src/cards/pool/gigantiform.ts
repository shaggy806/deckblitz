import { defineCard } from "../define.js";

const STATIC_TEXT = "Enchanted creature has base power and toughness 8/8 and has trample.";
const ETB =
  "When this Aura enters, if it was kicked, you may search your library for a card named Gigantiform, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Gigantiform",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  kicker: { cost: "{4}" },
  text: `Kicker {4}\nEnchant creature\n${STATIC_TEXT}\n${ETB}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setBasePt: { power: 8, toughness: 8 },
      grantKeywords: ["trample"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Gigantiform?",
        effect: {
          kind: "search-library",
          filter: { name: "Gigantiform" },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: ETB,
    },
  ],
});
