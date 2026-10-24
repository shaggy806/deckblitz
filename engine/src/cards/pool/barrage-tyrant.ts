import { defineCard } from "../define.js";

// EDHREC rank 21000. Devoid: colourless (`colors: []`).
//
// The Tyrant deals the damage, not the sacrificed creature (the ruling), so
// the sacrificed creature's lifelink or deathtouch doesn't apply; its power
// is read as it last existed.
const TEXT =
  "{2}{R}, Sacrifice another colorless creature: This creature deals damage equal to the sacrificed creature's power to any target.";

export default defineCard({
  name: "Barrage Tyrant",
  manaCost: "{4}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 5,
  toughness: 3,
  text: `Devoid (This card has no color.)\n${TEXT}`,
  activated: [
    {
      cost: {
        mana: "{2}{R}",
        tap: false,
        sacrifice: { filter: { type: "creature", colorless: true, controlledBy: "you" } },
      },
      otherOnly: true,
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "sacrificed" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
