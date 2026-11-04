import { defineCard } from "../define.js";

export default defineCard({
  name: "Gahiji, Honored One",
  manaCost: "{2}{R}{G}{W}",
  colors: ["R", "G", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: "Whenever a creature attacks one of your opponents or a planeswalker an opponent controls, that creature gets +2/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackedPlayerOrPlaneswalker: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a creature attacks one of your opponents or a planeswalker an opponent controls, that creature gets +2/+0 until end of turn.",
    },
  ],
});
