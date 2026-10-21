import { defineCard } from "../define.js";

export default defineCard({
  name: "D'Avenant Trapper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 3,
  toughness: 2,
  text: "Whenever you cast a historic spell, tap target creature an opponent controls. (Artifacts, legendaries, and Sagas are historic.)",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Whenever you cast a historic spell, tap target creature an opponent controls.",
    },
  ],
});
