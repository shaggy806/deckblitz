import { defineCard } from "../define.js";

// Innistrad: Crimson Vow. The two abilities are linked (rule 607.2a): the
// first exiles a card from any graveyard, chosen as it resolves (no target),
// and the second asks of the land played or the spell cast whether it shares
// a card type with "the exiled card" — an intervening if (rule 603.4), asked
// as it triggers and again as it resolves. With no exiled card (the first
// ability hasn't resolved, or exiled nothing), nothing shares a type with it.
// A token from another stint's exile doesn't count: a Protector that leaves
// and returns is a new object (rule 400.7).
const ENTER = "When this creature enters, exile a card from a graveyard.";
const PLAY =
  "Whenever you play a land or cast a spell, if it shares a card type with the exiled card, create a 1/1 white Human creature token.";
const SHARES = { kind: "trigger-object", filter: { sharesCardTypeWith: "exiled-with-source" } } as const;

export default defineCard({
  name: "Cemetery Protector",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${ENTER}\n${PLAY}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "graveyards",
        min: 1,
        max: 1,
        destination: "exile",
        leftover: "stay",
      },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "plays-land", who: "you" },
      condition: SHARES,
      targets: [],
      effect: { kind: "create-token", token: "Human Token", count: 1 },
      resolve: null,
      text: PLAY,
    },
    {
      trigger: { on: "cast-spell", who: "you" },
      condition: SHARES,
      targets: [],
      effect: { kind: "create-token", token: "Human Token", count: 1 },
      resolve: null,
      text: PLAY,
    },
  ],
});
