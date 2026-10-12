import { defineCard } from "../define.js";

// EDHREC rank 17627. Marvel Super Heroes Commander.
//
// The Moloid is Mole Man, Moloid Master's token, ability and all. X is
// counted as the ability resolves, so this enchantment — sacrificed as its
// cost, and a permanent card in your graveyard by then — counts itself.
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, you may mill two cards.";
const MOLOID_TEXT =
  '{5}{G}, Sacrifice this enchantment: Create X 1/1 green Minion creature tokens named Moloid, where X is the number of permanent cards in your graveyard. The tokens have "Whenever this token attacks, you may mill a card." Activate only as a sorcery.';
const PERMANENT_TYPES = ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] as const;

export default defineCard({
  name: "Return of the Mole Man",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${LANDFALL_TEXT}\n${MOLOID_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Mill two cards?",
        effect: { kind: "mill", target: "you", amount: 2 },
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Moloid",
        count: { countInGraveyard: { typesAnyOf: PERMANENT_TYPES, ownedBy: "you" } },
      },
      resolve: null,
      text: MOLOID_TEXT,
      sorcerySpeed: true,
    },
  ],
});
