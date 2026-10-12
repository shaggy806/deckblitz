import { defineCard } from "../define.js";

export default defineCard({
  name: "Deadshot Minotaur",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Minotaur"],
  power: 3,
  toughness: 4,
  cycling: { cost: "{R/G}" },
  text: "When this creature enters, it deals 3 damage to target creature with flying.\nCycling {R/G} ({R/G}, Discard this card: Draw a card.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 3 damage to target creature with flying.",
    },
  ],
});
