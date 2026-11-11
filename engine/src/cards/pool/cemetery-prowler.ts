import { defineCard } from "../define.js";

// Innistrad: Crimson Vow. The abilities are linked (rule 607.2a): the first
// exiles a card from any graveyard, chosen as it resolves (no target), and
// the last counts the card types a spell shares with the cards this Prowler
// exiled — each type once, however many exiled cards have it (the ruling).
// A Prowler that leaves and returns is a new object with nothing exiled
// (rule 400.7).
const EXILE_TEXT = "Whenever this creature enters or attacks, exile a card from a graveyard.";
const COST_TEXT = "Spells you cast cost {1} less to cast for each card type they share with cards exiled with this creature.";

const EXILE = {
  kind: "look-and-choose",
  zone: "graveyards",
  min: 1,
  max: 1,
  destination: "exile",
  leftover: "stay",
} as const;

export default defineCard({
  name: "Cemetery Prowler",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${EXILE_TEXT}\n${COST_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: EXILE, resolve: null, text: EXILE_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: EXILE, resolve: null, text: EXILE_TEXT },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: {},
        reduceGeneric: { cardTypesSharedWith: "exiled-with-source", of: "priced" },
        when: { caster: "you" },
      },
      text: COST_TEXT,
    },
  ],
});
