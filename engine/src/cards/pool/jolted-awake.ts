import { defineCard } from "../define.js";

// Modern Horizons 3. The energy is a `may`'s `costEnergy`, read as it
// applies: the target card's mana value (an {X} in it 0, rule 107.3g). With
// no target chosen there's no card to return. A chosen target gone illegal
// stops the whole spell, energy and all (rule 608.2b).
export default defineCard({
  name: "Jolted Awake",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Choose up to one target artifact or creature card in your graveyard. You get {E}{E} (two energy counters). Then you may pay an amount of {E} equal to that card's mana value. If you do, return it from your graveyard to the battlefield.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [
    {
      kind: "optional",
      of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "get-energy", amount: 2 },
      {
        kind: "may",
        prompt: "Pay {E} equal to that card's mana value to return it to the battlefield?",
        costEnergy: { manaValueOf: 0 },
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
    ],
  },
  cycling: { cost: "{2}" },
});
