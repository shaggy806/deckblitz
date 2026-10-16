import { defineCard } from "../define.js";

// EDHREC rank 16035.

export default defineCard({
  name: "Silver Deputy",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Mercenary"],
  power: 1,
  toughness: 2,
  text: "When this creature enters, you may search your library for a basic land card or a Desert card, reveal it, then shuffle and put it on top.\n{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card or a Desert card?",
        effect: {
          kind: "search-library",
          filter: { anyOf: [{ supertype: "basic", type: "land" }, { subtype: "Desert" }] },
          destination: "library-top",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for a basic land card or a Desert card, reveal it, then shuffle and put it on top.",
    },
  ],
});
