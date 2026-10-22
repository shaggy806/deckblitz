import { defineCard } from "../define.js";

const PING_TEXT =
  "{T}: This creature deals 1 damage to target player or planeswalker. Activate only if you control a Desert or there is a Desert card in your graveyard.";

export default defineCard({
  name: "Wall of Forgotten Pharaohs",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${PING_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
          { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Desert" } },
        ],
      },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
