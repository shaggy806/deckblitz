import { defineCard } from "../define.js";

const HAND_TEXT = "{2}{R}, Discard this card: It deals 2 damage to each creature.";

export default defineCard({
  name: "Mjölnir, Hammer of Thor",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `When Mjölnir enters, it deals 4 damage to up to one target creature.\nDouble all damage equipped creature would deal.\nEquip worthy {1} (A creature is worthy if it's a legendary non-Villain that's red and/or white.)\n${HAND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "When Mjölnir enters, it deals 4 damage to up to one target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", multiplier: 2, fromAttached: true },
      text: "Double all damage equipped creature would deal.",
    },
  ],
  activated: [
    {
      // Worthy: a legendary non-Villain creature that's red and/or white.
      cost: { mana: "{1}", tap: false },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: {
            type: "creature",
            supertype: "legendary",
            notSubtypes: ["Villain"],
            anyOf: [{ colors: ["R"] }, { colors: ["W"] }],
          },
        },
      ],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip worthy {1}",
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature" }, amount: 2 },
      resolve: null,
      zone: "hand",
      text: HAND_TEXT,
    },
  ],
});
