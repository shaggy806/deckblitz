import { defineCard } from "../define.js";

// Ruling: with fewer than two cards in hand it discards the whole hand, then
// still draws two. Only the nonland cards discarded this way make tokens.
const ENTERS_TEXT =
  "When this creature enters, discard two cards, then draw two cards. For each nonland card discarded this way, create a 1/1 red Elemental creature token.";
const GRAVEYARD_TEXT = "{3}{R}{R}, Exile this card from your graveyard: Create two 1/1 red Elemental creature tokens.";

export default defineCard({
  name: "Seasoned Pyromancer",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${GRAVEYARD_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "1/1 Red Elemental Token", count: 2 },
      resolve: null,
      text: GRAVEYARD_TEXT,
      zone: "graveyard",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 2 },
          { kind: "draw", amount: 2 },
          {
            kind: "create-token",
            token: "1/1 Red Elemental Token",
            count: { thisWay: "discarded", filter: { notTypes: ["land"] } },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
