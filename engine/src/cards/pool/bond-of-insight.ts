import { defineCard } from "../define.js";

// The returned cards aren't targeted: they're chosen as it resolves, after
// the mill, so the cards just milled can be among them (the ruling).
export default defineCard({
  name: "Bond of Insight",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each player mills four cards. Return up to two instant and/or sorcery cards from your graveyard to your hand. Exile Bond of Insight.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "each-player", amount: 4 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 2,
        destination: "hand",
        leftover: "stay",
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
    ],
  },
  exileOnResolve: true,
});
