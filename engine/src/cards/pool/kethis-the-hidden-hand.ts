import { defineCard } from "../define.js";

// Rulings:
//   Kethis's last ability doesn't change when you can play the legendary cards.
//   Kethis's last ability affects only legendary cards that are in your graveyard at the time it
//     resolves. Legendary cards put into your graveyard later in the turn won't gain the ability.

const REDUCTION = "Legendary spells you cast cost {1} less to cast.";
const GRANT =
  'Exile two legendary cards from your graveyard: Until end of turn, each legendary card in your graveyard gains "You may play this card from your graveyard."';

export default defineCard({
  name: "Kethis, the Hidden Hand",
  manaCost: "{W}{B}{G}",
  colors: ["W", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Advisor"],
  power: 3,
  toughness: 4,
  text: `${REDUCTION}\n${GRANT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { supertype: "legendary" }, reduceGeneric: 1, when: { caster: "you" } },
      text: REDUCTION,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, exileFromGraveyard: { count: 2, filter: { supertype: "legendary" } } },
      targets: [],
      // The legendary cards in the graveyard as it resolves (611.2c), lands too ("play").
      effect: { kind: "grant-play", cards: { filter: { supertype: "legendary" } }, duration: "end-of-turn", play: true },
      resolve: null,
      text: GRANT,
    },
  ],
});
