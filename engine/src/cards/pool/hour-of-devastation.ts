import { defineCard } from "../define.js";

// Only the creatures on the battlefield as it resolves lose indestructible
// (rule 611.2c — its ruling: one that enters later keeps it). The damage is one
// `damage-all` over every creature and every planeswalker that isn't a Bolas —
// a creature is dealt it whatever its subtypes.
export default defineCard({
  name: "Hour of Devastation",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "All creatures lose indestructible until end of turn. Hour of Devastation deals 5 damage to each creature and each non-Bolas planeswalker.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-keywords", filter: { type: "creature" }, keywords: ["indestructible"], duration: "end-of-turn" },
      {
        kind: "damage-all",
        filter: { anyOf: [{ type: "creature" }, { type: "planeswalker", notSubtypes: ["Bolas"] }] },
        amount: 5,
      },
    ],
  },
});
