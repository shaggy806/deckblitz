import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, you may reveal X black cards in your hand. If you do, target creature gets -X/-X until end of turn.";

export default defineCard({
  name: "Nightshade Assassin",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  madness: { cost: "{1}{B}" },
  text: `First strike\n${ETB_TEXT}\nMadness {1}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  triggered: [
    {
      // X is chosen as it resolves — how many black cards revealed (none is
      // "didn't"). An illegal target means it doesn't resolve, so nothing is
      // revealed (the ruling).
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: { cardsInHand: "you" },
            filter: { colors: ["B"] },
            destination: "reveal",
            leftover: "stay",
          },
          // None revealed is "didn't": -0/-0 changes nothing.
          {
            kind: "modify-pt",
            target: 0,
            power: { product: [{ thisWay: "revealed", who: "you" }, -1] },
            toughness: { product: [{ thisWay: "revealed", who: "you" }, -1] },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
