import { defineCard } from "../define.js";

// Rulings:
//   You choose the opponents for each effect as the spell resolves.
//   You may choose the same opponent for each of the effects, or you may choose different
//     opponents. None of the affected players are targets of the spell.

export default defineCard({
  name: "Benevolent Offering",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose an opponent. You and that player each create three 1/1 white Spirit creature tokens with flying.\nChoose an opponent. You gain 2 life for each creature you control and that player gains 2 life for each creature they control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-opponent",
        then: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "create-token", token: "Spirit Token", count: 3 },
            { kind: "create-token", token: "Spirit Token", count: 3, who: "that-player" },
          ],
        },
      },
      {
        kind: "choose-opponent",
        then: {
          kind: "sequence",
          effects: [
            { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" }, times: 2 } },
            {
              kind: "gain-life",
              who: "that-player",
              amount: { countOf: { type: "creature", controlledBy: "you" }, times: 2, forPlayer: "that-player" },
            },
          ],
        },
      },
    ],
  },
});
