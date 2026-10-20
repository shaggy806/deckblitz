import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, you may exile a card from a graveyard. If a creature card was exiled this way, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Deathbonnet Hulk",
  art: "https://cards.scryfall.io/art_crop/back/a/2/a2cda10b-7cd5-4cf5-87bd-c3b8c6aa2b47.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Horror"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // Not targeted: the card is chosen from every graveyard as it resolves,
      // or none (the "may").
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "graveyards",
            min: 0,
            max: 1,
            destination: "exile",
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Deathbonnet Sprout", "Deathbonnet Hulk"],
  transform: true,
});
