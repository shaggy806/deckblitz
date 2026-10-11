import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloombrute",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Plant", "Elemental"],
  power: 4,
  toughness: 4,
  text: "Whenever you gain life, draw a card. This ability triggers only once each turn.\n{4}{G}{W}: Target creature gains trample and lifelink until end of turn.",
  activated: [
    {
      cost: { mana: "{4}{G}{W}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{4}{G}{W}: Target creature gains trample and lifelink until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you gain life, draw a card. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
