import { defineCard } from "../define.js";

// EDHREC rank 4175.
//
// Rulings:
//   [2024-03-08] Rad counters are a kind of counter that a player may have. They’re not associated
//     with any specific permanents.
//   [2024-03-08] Rad counters don’t go away as steps, phases, or turns end. They only go away when
//     an effect instructs a player to remove rad counters from themselves.
//   [2024-03-08] In a game using the shared team turns option, such as an Archenemy or Two-Headed
//     Giant game, the inherent triggered ability associated with rad counters triggers once for
//     each player on the active team that has rad counters. Each instance of that ability is
//     controlled by one of those players.
//   [2024-03-08] There is an inherent triggered ability associated with having rad counters. This
//     triggered ability has no source and is controlled by the active player. The full text of
//     this ability is “At the beginning of the precombat main phase of a player with rad counters,
//     that player mills cards equal to the number of rad counters they have. For each nonland card
//     milled this way, that player loses 1 life and removes one rad counter from themselves.”
//   [2024-03-08] If a player has fewer cards remaining in their library than the number of rad
//     counters they have when the triggered ability resolves, they’ll mill as many cards as they
//     can.
//   [2024-03-08] Any effects (such as proliferate) that interact with counters a player gets, has,
//     or loses can interact with rad counters.
//   [2024-03-08] Keep track of how many rad counters each player has. Potential ways to track this
//     include writing them down on paper or using dice, but any method that is clear and mutually
//     agreeable is fine.
//   [2024-03-08] The cards are milled all at once, which means abilities that trigger “whenever
//     one or more nonland cards are milled” will trigger exactly once as long as at least one
//     nonland card was milled.

export default defineCard({
  name: "Mirelurk Queen",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab", "Mutant"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen this creature enters, target player gets two rad counters.\nWhenever one or more nonland cards are milled, draw a card, then put a +1/+1 counter on this creature. This ability triggers only once each turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "add-player-counters", counter: "rad", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature enters, target player gets two rad counters.",
    },
    {
      trigger: { on: "mills", who: "any", filter: { notTypes: ["land"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever one or more nonland cards are milled, draw a card, then put a +1/+1 counter on this creature. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
