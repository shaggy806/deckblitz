import { defineCard } from "../define.js";

// The two abilities are linked (rule 607.2a), as Cemetery Protector's are: the
// card is chosen from any graveyard as the first resolves, no target, and the
// second is an intervening if on what was played or cast (rule 603.4). With
// nothing exiled, nothing shares a type with it.
const ENTER = "When this creature enters, exile a card from a graveyard.";
const PLAY =
  "Whenever a player plays a land or casts a spell, if it shares a card type with the exiled card, this creature deals 2 damage to that player.";
const SHARES = { kind: "trigger-object", filter: { sharesCardTypeWith: "exiled-with-source" } } as const;

export default defineCard({
  name: "Cemetery Gatekeeper",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${ENTER}\n${PLAY}`,
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
      trigger: { on: "plays-land", who: "any" },
      condition: SHARES,
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-player" },
      resolve: null,
      text: PLAY,
    },
    {
      trigger: { on: "cast-spell", who: "any" },
      condition: SHARES,
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: PLAY,
    },
  ],
});
