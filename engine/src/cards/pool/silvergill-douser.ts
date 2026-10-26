import { defineCard } from "../define.js";

export default defineCard({
  name: "Silvergill Douser",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{T}: Target creature gets -X/-0 until end of turn, where X is the number of Merfolk and/or Faeries you control.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      // A permanent that's both a Merfolk and a Faerie counts once (the
      // ruling): `subtypes` is an OR over each permanent.
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [{ countOf: { subtypes: ["Merfolk", "Faerie"], controlledBy: "you" } }, -1] },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{T}: Target creature gets -X/-0 until end of turn, where X is the number of Merfolk and/or Faeries you control.",
    },
  ],
});
