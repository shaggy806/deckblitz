import { defineCard } from "../define.js";

export default defineCard({
  name: "Diligent Excavator",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 3,
  text: "Whenever you cast a historic spell, target player mills two cards. (Artifacts, legendaries, and Sagas are historic.)",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 2 },
      resolve: null,
      text: "Whenever you cast a historic spell, target player mills two cards.",
    },
  ],
});
