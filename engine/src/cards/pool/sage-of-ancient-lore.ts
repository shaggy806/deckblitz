import { defineCard } from "../define.js";

// EDHREC rank 10472.
//
// Rulings:
//   [2016-04-08] The abilities that transform a Werewolf back and forth look at the entire
//     previous turn, even if the Werewolf with that ability wasn't on the battlefield for some or
//     all of that turn.
//   [2016-04-08] If you have no cards in hand after Sage of Ancient Lore enters the battlefield,
//     it will be put into your graveyard before its first triggered ability resolves. You'll draw
//     a card, but Sage of Ancient Lore will already be gone.
//   [2016-04-08] To trigger the Werewolf's back face's transform ability, a single player must
//     have cast two or more spells during the previous turn. If multiple players each cast just
//     one spell during the previous turn, the ability won't trigger.

export default defineCard({
  name: "Sage of Ancient Lore",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman", "Werewolf"],
  power: 0,
  toughness: 0,
  text: "Sage of Ancient Lore's power and toughness are each equal to the number of cards in your hand.\nWhen this creature enters, draw a card.\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature enters, draw a card.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", none: true },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0 },
      text: "Sage of Ancient Lore's power and toughness are each equal to the number of cards in your hand.",
    },
  ],
  faces: ["Sage of Ancient Lore", "Werewolf of Ancient Hunger"],
  transform: true,
});
