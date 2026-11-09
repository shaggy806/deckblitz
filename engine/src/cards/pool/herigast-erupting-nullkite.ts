import { defineCard } from "../define.js";

const CAST = "When you cast this spell, you may exile your hand. If you do, draw three cards.";
const GRANT = "Each creature spell you cast has emerge. The emerge cost is equal to its mana cost.";

export default defineCard({
  name: "Herigast, Erupting Nullkite",
  manaCost: "{9}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi", "Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  emerge: { cost: "{6}{R}{R}" },
  text: `Emerge {6}{R}{R} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\n${CAST}\nFlying\n${GRANT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile your hand and draw three cards?",
        effect: { kind: "exile-graveyard", target: "you", fromHand: "only" },
        then: { kind: "draw", amount: 3 },
      },
      resolve: null,
      text: CAST,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "creature" }, keywordValues: [{ keyword: "emerge", cost: "mana-cost" }] },
      text: GRANT,
    },
  ],
});
