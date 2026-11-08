import { defineCard } from "../define.js";

export default defineCard({
  name: "Advancing the Spirit",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "When this enchantment enters, draw a card.\nYou may pay {0} rather than pay the power-up cost of the first power-up ability you activate during each of your turns.",
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: { kind: "draw", amount: 1 }, resolve: null, text: "When this enchantment enters, draw a card." },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      alternativeAbilityCost: { kind: "power-up", mana: "{0}", firstEachTurn: true },
      text: "You may pay {0} rather than pay the power-up cost of the first power-up ability you activate during each of your turns.",
    },
  ],
});
