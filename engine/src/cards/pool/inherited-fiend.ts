import { defineCard } from "../define.js";

const TEXT = "{2}{B}: Exile target creature card from a graveyard. Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Inherited Fiend",
  art: "https://cards.scryfall.io/art_crop/back/e/6/e6dd05f0-a3c0-4bd6-a1d1-a74540623093.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Heirloom Mirror", "Inherited Fiend"],
  transform: true,
});
