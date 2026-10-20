import { defineCard } from "../define.js";

// EDHREC rank 10959.
//
// White Widow's "each of up to two target creatures": two optional slots, the
// second never the first's creature.
const SAC_TEXT =
  "{G}{W}{W}, {T}, Sacrifice this land: Put a +1/+1 counter on each of up to two target creatures you control. They gain vigilance and lifelink until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Bretagard Stronghold",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {G}.\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
    {
      cost: { mana: "{G}{W}{W}", tap: true, sacrifice: "self" },
      targets: [
        { kind: "optional", of: "creature-you-control" },
        { kind: "optional", of: { kind: "other", of: "creature-you-control", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 1, keyword: "vigilance", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 1, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
