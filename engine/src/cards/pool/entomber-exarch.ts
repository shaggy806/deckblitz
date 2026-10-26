import { defineCard } from "../define.js";

// EDHREC rank 18671.
export default defineCard({
  name: "Entomber Exarch",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, choose one —\n• Return target creature card from your graveyard to your hand.\n• Target opponent reveals their hand. You choose a noncreature card from it. That player discards that card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Return target creature card from your graveyard to your hand.",
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
          {
            text: "Target opponent reveals their hand. You choose a noncreature card from it. That player discards that card.",
            targets: ["opponent"],
            effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["creature"] } },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
