import { defineCard } from "../define.js";

// EDHREC rank 11185.
//
// Rulings:
//   [2011-06-01] You choose whether or not to sacrifice Whispering Specter, and the number of
//     poison counters the player has is counted, when the triggered ability resolves.
const TEXT =
  "Whenever this creature deals combat damage to a player, you may sacrifice it. If you do, that player discards a card for each poison counter they have.";

export default defineCard({
  name: "Whispering Specter",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Specter"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "infect"],
  text: `Flying\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      // Cacophony Scamp's shape: the discard happens only once it's sacrificed.
      effect: {
        kind: "may",
        prompt: "Sacrifice Whispering Specter to have that player discard a card for each poison counter they have?",
        effect: {
          kind: "sacrifice-source",
          then: {
            kind: "discard",
            target: "trigger-player",
            amount: { playerCounters: "poison", who: "trigger-player" },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
