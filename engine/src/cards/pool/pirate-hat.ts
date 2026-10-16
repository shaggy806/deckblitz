import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 14485. The Lost Caverns of Ixalan.
//
// Biorganic Carapace's granted trigger (Furtive Courier's loot), and Thinking
// Cap's narrowed equip ("Equip Pirate {1}") beside the ordinary Equip {2}.

const STATIC_TEXT =
  'Equipped creature gets +1/+1 and has "Whenever this creature attacks, draw a card, then discard a card."';
const LOOT_TEXT = "Whenever this creature attacks, draw a card, then discard a card.";

export default defineCard({
  name: "Pirate Hat",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip Pirate {1}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1 },
              { kind: "discard", target: "you", amount: 1 },
            ],
          },
          resolve: null,
          text: LOOT_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Pirate" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip Pirate {1}",
      sorcerySpeed: true,
    },
    equip("{2}"),
  ],
});
