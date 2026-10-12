import { defineCard } from "../define.js";

// EDHREC rank 17087.
//
// "Behold an Elemental or pay {2}": a choice of whole costs (rule 601.2b),
// beholding offered only with an Elemental to reveal from the hand or choose
// on the battlefield (701.4a). The pump targets, so it isn't a mana ability
// (the ruling); the mana comes only the third time it resolves in a turn
// (Omnath's count — one that fizzles never resolved).

const PUMP_TEXT =
  "{R}: Target creature you control gains trample until end of turn. If this is the third time this ability has resolved this turn, add {R}{R}{R}{R}.";

export default defineCard({
  name: "Soulbright Seeker",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Sorcerer"],
  power: 2,
  toughness: 1,
  additionalCost: {
    options: [
      { text: "Behold an Elemental", behold: { filter: { subtype: "Elemental" }, text: "an Elemental" } },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  text: `As an additional cost to cast this spell, behold an Elemental or pay {2}. (To behold an Elemental, choose an Elemental you control or reveal an Elemental card from your hand.)\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 3 },
            then: { kind: "add-mana", mana: "R", amount: 4 },
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
