import { defineCard } from "../define.js";

// EDHREC rank 22337. Mind Over Matter's "you may tap or untap" shape: a
// resolution-time choice of tap, untap or neither.

const TEXT = "{U}, {T}, Discard a card: You may tap or untap target artifact, creature, or land.";

export default defineCard({
  name: "Trickster Mage",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: true, discard: { count: 1 } },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it.", effect: { kind: "tap", target: 0 } },
          { text: "Untap it.", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
