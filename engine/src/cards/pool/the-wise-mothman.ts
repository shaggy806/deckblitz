import { defineCard } from "../define.js";

// EDHREC rank 3727.
//
// Rulings:
//   [2024-03-08] If more than one player is instructed to mill at the same time (by the activated
//     ability of Raul, Trouble Shooter, for example), as long as at least one nonland card is
//     milled, The Wise Mothman’s last ability will trigger just once.
//   [2024-03-08] Any effects (such as proliferate) that interact with counters a player gets, has,
//     or loses can interact with rad counters.
//   [2024-03-08] Keep track of how many rad counters each player has. Potential ways to track this
//     include writing them down on paper or using dice, but any method that is clear and mutually
//     agreeable is fine.
//   [2024-03-08] In a game using the shared team turns option, such as an Archenemy or Two-Headed
//     Giant game, the inherent triggered ability associated with rad counters triggers once for
//     each player on the active team that has rad counters. Each instance of that ability is
//     controlled by one of those players.
//   [2024-03-08] Rad counters are a kind of counter that a player may have. They’re not associated
//     with any specific permanents.
//   [2024-03-08] If a player has fewer cards remaining in their library than the number of rad
//     counters they have when the triggered ability resolves, they’ll mill as many cards as they
//     can.
//   [2024-03-08] There is an inherent triggered ability associated with having rad counters. This
//     triggered ability has no source and is controlled by the active player. The full text of
//     this ability is “At the beginning of the precombat main phase of a player with rad counters,
//     that player mills cards equal to the number of rad counters they have. For each nonland card
//     milled this way, that player loses 1 life and removes one rad counter from themselves.”
//   [2024-03-08] Rad counters don’t go away as steps, phases, or turns end. They only go away when
//     an effect instructs a player to remove rad counters from themselves.
//   [2024-03-08] The cards are milled all at once, which means abilities that trigger “whenever
//     one or more nonland cards are milled” will trigger exactly once as long as at least one
//     nonland card was milled.

export default defineCard({
  name: "The Wise Mothman",
  manaCost: "{1}{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect", "Mutant"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever The Wise Mothman enters or attacks, each player gets a rad counter.\nWhenever one or more nonland cards are milled, put a +1/+1 counter on each of up to X target creatures, where X is the number of nonland cards milled this way.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "rad", amount: 1, who: "each-player" },
      resolve: null,
      text: "Whenever The Wise Mothman enters or attacks, each player gets a rad counter.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "rad", amount: 1, who: "each-player" },
      resolve: null,
      text: "Whenever The Wise Mothman enters or attacks, each player gets a rad counter.",
    },
    {
      trigger: { on: "mills", who: "any", filter: { notTypes: ["land"] } },
      // X is fixed as the trigger goes on the stack, when its targets are
      // chosen: the nonland cards that one mill event milled.
      targets: [{ kind: "any-number", of: "creature", max: { triggerValue: true } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Whenever one or more nonland cards are milled, put a +1/+1 counter on each of up to X target creatures, where X is the number of nonland cards milled this way.",
    },
  ],
});
