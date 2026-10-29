import { defineCard } from "../define.js";

export default defineCard({
  name: "Mtenda Lion",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature attacks, defending player may pay {U}. If that player does, prevent all combat damage that would be dealt by this creature this turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-player",
        options: [{ pay: "{U}", text: "Pay {U}" }],
        ifDid: { kind: "damage-rule", by: { target: "source" }, combat: true },
      },
      resolve: null,
      text: "Whenever this creature attacks, defending player may pay {U}. If that player does, prevent all combat damage that would be dealt by this creature this turn.",
    },
  ],
});
