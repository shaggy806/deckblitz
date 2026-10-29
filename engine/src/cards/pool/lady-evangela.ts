import { defineCard } from "../define.js";

// EDHREC rank 28509.

export default defineCard({
  name: "Lady Evangela",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: "{W}{B}, {T}: Prevent all combat damage that would be dealt by target creature this turn.",
  activated: [
    {
      cost: { mana: "{W}{B}", tap: true },
      targets: ["creature"],
      effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
      resolve: null,
      text: "{W}{B}, {T}: Prevent all combat damage that would be dealt by target creature this turn.",
    },
  ],
});
