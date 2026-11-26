import { defineCard } from "../define.js";

// Fifth Dawn. EDHREC rank 20611.
//
// Every shuffle in play comes from a spell or an ability (a resolving
// instruction, or a card's own "shuffle it into its owner's library
// instead"); the opening hand's shuffle is no event. A library of zero cards
// still is shuffled (rule 701.24e, the ruling).

const TEXT = "Whenever a spell or ability causes a player to shuffle their library, this artifact deals 2 damage to that player.";

export default defineCard({
  name: "Psychogenic Probe",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "shuffles-library", who: "any" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
