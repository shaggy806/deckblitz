import { defineCard } from "../define.js";

// EDHREC rank 6656. The copy keeps the spell's targets (the ruling).
const TEXT =
  "Time Lord's Prerogative — Whenever you cast a historic spell, copy it, except the copy isn't legendary. This ability triggers only once each turn. (Artifacts, legendaries, and Sagas are historic. A copy of a permanent spell becomes a token.)";

export default defineCard({
  name: "The Sixth Doctor",
  manaCost: "{4}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", except: { notLegendary: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
