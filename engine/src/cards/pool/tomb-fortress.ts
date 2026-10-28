import { defineCard } from "../define.js";

export default defineCard({
  name: "Tomb Fortress",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {B}.\n{2}{B}{B}{B}, {T}, Exile this land: Mill four cards, then return a creature card from your graveyard to the battlefield. Activate only as a sorcery.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: "{2}{B}{B}{B}", tap: true, exileSelf: true },
      targets: [],
      // The creature needn't be one just milled (the ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "battlefield", count: 1 },
        ],
      },
      resolve: null,
      text: "{2}{B}{B}{B}, {T}, Exile this land: Mill four cards, then return a creature card from your graveyard to the battlefield. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
