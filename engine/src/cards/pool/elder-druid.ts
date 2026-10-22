import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 26557.
//
// Rulings:
//   [2004-10-04] The decision of whether to tap or untap is made on resolution.
//
// Hyperion Blacksmith's "you may tap or untap": an unannounced `modal` of none
// or one, chosen as the ability resolves.

const TEXT = "{3}{G}, {T}: You may tap or untap target artifact, creature, or land.";

export default defineCard({
  name: "Elder Druid",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric", "Druid"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: true },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
