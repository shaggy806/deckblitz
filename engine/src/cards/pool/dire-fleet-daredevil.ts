import { defineCard } from "../define.js";

// EDHREC rank 3434. A card permission for this turn: timing stays the card's
// (the ruling), and a spell cast this way is exiled instead of going to a
// graveyard.
export default defineCard({
  name: "Dire Fleet Daredevil",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: "First strike\nWhen this creature enters, exile target instant or sorcery card from an opponent's graveyard. You may cast it this turn, and mana of any type can be spent to cast that spell. If that spell would be put into a graveyard, exile it instead.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "exile",
        target: 0,
        mayPlay: { duration: "end-of-turn", spendAs: "any-type", exileAfter: true },
      },
      resolve: null,
      text: "When this creature enters, exile target instant or sorcery card from an opponent's graveyard. You may cast it this turn, and mana of any type can be spent to cast that spell. If that spell would be put into a graveyard, exile it instead.",
    },
  ],
});
