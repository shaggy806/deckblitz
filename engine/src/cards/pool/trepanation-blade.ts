import { defineCard } from "../define.js";

// EDHREC rank 9276.
//
// Rulings:
//   [2017-11-17] If the equipped creature is attacking a planeswalker, the controller of the
//     planeswalker is the defending player.
//   [2017-11-17] The land card is counted when calculating the bonus, and it will be put into the
//     graveyard with the other revealed cards.
//
// The defending player is the attack trigger's `"trigger-player"`; the bonus
// counts every card the reveal showed (`{ thisWay: "revealed" }`), the land
// included, whether or not one was found.

const TRIGGER_TEXT =
  "Whenever equipped creature attacks, defending player reveals cards from the top of their library until they reveal a land card. The creature gets +1/+0 until end of turn for each card revealed this way. That player puts the revealed cards into their graveyard.";

export default defineCard({
  name: "Trepanation Blade",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TRIGGER_TEXT}\nEquip {2}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: "trigger-player",
            effect: { kind: "reveal-until", whose: "that-player", filter: { type: "land" }, rest: "graveyard" },
          },
          {
            kind: "modify-pt",
            target: "trigger-object",
            power: { thisWay: "revealed" },
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
