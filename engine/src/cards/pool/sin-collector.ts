import { defineCard } from "../define.js";


export default defineCard({
  name: "Sin Collector",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, target opponent reveals their hand. You choose an instant or sorcery card from it and exile that card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        destination: "exile",
      },
      resolve: null,
      text: "When this creature enters, target opponent reveals their hand. You choose an instant or sorcery card from it and exile that card.",
    },
  ],
});
