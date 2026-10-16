import { defineCard } from "../define.js";

export default defineCard({
  name: "Peter Parker",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Hero"],
  power: 0,
  toughness: 1,
  text: "When Peter Parker enters, create a 2/1 green Spider creature token with reach.\n{1}{G}{W}{U}: Transform Peter Parker. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}{G}{W}{U}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{1}{G}{W}{U}: Transform Peter Parker. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "2/1 Green Spider Token (Reach)", count: 1 },
      resolve: null,
      text: "When Peter Parker enters, create a 2/1 green Spider creature token with reach.",
    },
  ],
  faces: ["Peter Parker", "Amazing Spider-Man"],
});
