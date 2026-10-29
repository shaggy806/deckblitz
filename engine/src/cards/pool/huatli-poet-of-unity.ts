import { defineCard } from "../define.js";

const TRANSFORM_TEXT =
  "{3}{R/W}{R/W}: Exile Huatli, then return her to the battlefield transformed under her owner's control. Activate only as a sorcery.";

// The transform is Crystal Fragments' shape: a flicker that returns it
// transformed, so Roar of the Fifth People enters as a new Saga with its first
// lore counter.
export default defineCard({
  name: "Huatli, Poet of Unity",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Bard"],
  power: 2,
  toughness: 3,
  text: `When Huatli enters, search your library for a basic land card, reveal it, put it into your hand, then shuffle.\n${TRANSFORM_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{R/W}{R/W}", tap: false },
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: TRANSFORM_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: "When Huatli enters, search your library for a basic land card, reveal it, put it into your hand, then shuffle.",
    },
  ],
  faces: ["Huatli, Poet of Unity", "Roar of the Fifth People"],
  transform: true,
});
