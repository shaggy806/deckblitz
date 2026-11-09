import { defineCard } from "../define.js";

export default defineCard({
  name: "Planar Guide",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text:
    "{3}{W}, Exile this creature: Exile all creatures. At the beginning of the next end step, return those cards " +
    "to the battlefield under their owners' control.",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: {
        kind: "flicker",
        target: { all: { type: "creature" } },
        returnAt: { step: "end" },
        returnText: "Return those cards to the battlefield under their owners' control.",
      },
      resolve: null,
      text:
        "{3}{W}, Exile this creature: Exile all creatures. At the beginning of the next end step, return those " +
        "cards to the battlefield under their owners' control.",
    },
  ],
});
