import { defineCard } from "../define.js";

// EDHREC rank 23491.

const HAND_TEXT = "{W}{B}, Discard this card: It deals 2 damage to target creature. You gain 2 life.";

export default defineCard({
  name: "Locutus, the One Who Speaks",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 1,
  toughness: 1,
  text: `Artifact creatures you control get +1/+1.\n${HAND_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}{B}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      zone: "hand",
      text: HAND_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantPt: [1, 1],
      text: "Artifact creatures you control get +1/+1.",
    },
  ],
});
