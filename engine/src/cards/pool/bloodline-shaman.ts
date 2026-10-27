import { defineCard } from "../define.js";

const TEXT =
  "{T}: Choose a creature type. Reveal the top card of your library. If that card is a creature card of the chosen type, put it into your hand. Otherwise, put it into your graveyard.";

export default defineCard({
  name: "Bloodline Shaman",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: {
          kind: "look-and-choose",
          zone: "library",
          count: 1,
          reveal: true,
          min: 1,
          max: 1,
          filter: { type: "creature", subtype: "$chosen" },
          destination: "hand",
          leftover: "graveyard",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
