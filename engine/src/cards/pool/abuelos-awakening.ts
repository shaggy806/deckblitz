import { defineCard } from "../define.js";

// EDHREC rank 15177. Lost Caverns of Ixalan Commander. The X counters are a
// `withCounters` amount read as it resolves, so it enters with them (Nine-Lives
// Familiar); "It's a 1/1 Spirit creature with flying in addition" is Excava's
// `enterAs`.
const TEXT =
  "Return target artifact or non-Aura enchantment card from your graveyard to the battlefield with X additional +1/+1 counters on it. It's a 1/1 Spirit creature with flying in addition to its other types.";

export default defineCard({
  name: "Abuelo's Awakening",
  manaCost: "{X}{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { anyOf: [{ type: "artifact" }, { type: "enchantment", notSubtypes: ["Aura"] }] },
    },
  ],
  effect: {
    kind: "put-onto-battlefield",
    target: 0,
    withCounters: { kind: "+1/+1", amount: "x" },
    enterAs: { addTypes: ["creature"], addSubtypes: ["Spirit"], power: 1, toughness: 1, keywords: ["flying"] },
  },
});
