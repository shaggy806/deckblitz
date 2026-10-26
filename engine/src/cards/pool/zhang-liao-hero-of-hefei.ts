import { defineCard } from "../define.js";

const TEXT = "Whenever Zhang Liao deals damage to an opponent, that opponent discards a card.";

export default defineCard({
  name: "Zhang Liao, Hero of Hefei",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
