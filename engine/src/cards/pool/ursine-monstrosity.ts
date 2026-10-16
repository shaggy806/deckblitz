import { defineCard } from "../define.js";

// EDHREC rank 9203.
//
// Rulings:
//   [2024-11-15] If you can't mill a card, you'll still follow the rest of the instructions of
//     Ursine Monstrosity's last ability.
//   [2024-11-15] Ursine Monstrosity must attack the chosen player if able, not a planeswalker they
//     control or a battle they protect.
//   [2024-11-15] If your turn has multiple combat phases, Ursine Monstrosity's last ability
//     triggers at the beginning of each of them. Ignore any choices made for its last ability
//     during previous combat phases.
//
// Territorial Hellkite's random attack requirement, this combat only. The
// card types are counted once, as it resolves (after the mill), and the
// bonus is locked in for the turn (rule 608.2h).
const COMBAT =
  "At the beginning of combat on your turn, mill a card and choose an opponent at random. This creature attacks that player this combat if able. Until end of turn, this creature gains indestructible and gets +1/+1 for each card type among cards in your graveyard.";
const TYPES = { cardTypesInGraveyard: { ownedBy: "you" } } as const;

export default defineCard({
  name: "Ursine Monstrosity",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear", "Mutant"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${COMBAT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          { kind: "attack-random-opponent", target: "source" },
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "modify-pt", target: "source", power: TYPES, toughness: TYPES, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT,
    },
  ],
});
