import { defineCard } from "../define.js";

// EDHREC rank 2873.

export default defineCard({
  name: "Metamorphosis Fanatic",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  miracle: { cost: "{1}{B}" },
  text: "Lifelink\nWhen this creature enters, return up to one target creature card from your graveyard to the battlefield with a lifelink counter on it.\nMiracle {1}{B} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
      effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "lifelink", amount: 1 } },
      resolve: null,
      text: "When this creature enters, return up to one target creature card from your graveyard to the battlefield with a lifelink counter on it.",
    },
  ],
});
