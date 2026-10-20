import { defineCard } from "../define.js";

// EDHREC rank 21345.
//
// Rulings:
//   [2022-02-18] Discarding the card is part of the cost to activate a channel ability.
//   [2022-02-18] If a channel ability requires a target, you may not activate it without a target
//     just to discard the card.
//
// Born to Drive's shape: the bonus applies only while the enchanted
// permanent is a creature (a crewed Vehicle is one, an uncrewed one isn't).

const STATIC_TEXT = "As long as enchanted permanent is a creature, it gets +3/+3 and has reach.";
const CHANNEL_TEXT = "Channel — {1}{G}, Discard this card: Target creature gets +3/+3 and gains reach until end of turn.";

export default defineCard({
  name: "Favor of Jukai",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${STATIC_TEXT}\n${CHANNEL_TEXT}`,
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPt: [3, 3],
      grantKeywords: ["reach"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      zone: "hand",
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CHANNEL_TEXT,
    },
  ],
});
