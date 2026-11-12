import { defineCard } from "../define.js";

// EDHREC rank 2256.
// "Without being played" is the filter's `played: false` (rule 305.1): a land
// an effect puts onto the battlefield (a fetch, a ramp spell) wasn't played.
// "One or more" is one trigger per simultaneous entry (`batched`), and "do
// this only once each turn" is the `may`'s `oncePerTurn`.
export default defineCard({
  name: "Deep Gnome Terramancer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Gnome", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: "Flash\nMold Earth — Whenever one or more lands enter under an opponent's control without being played, you may search your library for a Plains card, put it onto the battlefield tapped, then shuffle. Do this only once each turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "opponent", filter: { type: "land", played: false }, batched: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Plains card?",
        oncePerTurn: true,
        effect: {
          kind: "search-library",
          filter: { subtype: "Plains" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
      resolve: null,
      text: "Mold Earth — Whenever one or more lands enter under an opponent's control without being played, you may search your library for a Plains card, put it onto the battlefield tapped, then shuffle. Do this only once each turn.",
    },
  ],
});
