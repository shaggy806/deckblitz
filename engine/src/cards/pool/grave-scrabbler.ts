import { defineCard } from "../define.js";

const TRIGGER =
  "When this creature enters, if its madness cost was paid, you may return target creature card from a graveyard to its owner's hand.";

export default defineCard({
  name: "Grave Scrabbler",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  madness: { cost: "{1}{B}" },
  text: `Madness {1}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-alternative-cost-paid", madness: true },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
