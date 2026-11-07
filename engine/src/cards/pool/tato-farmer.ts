import { defineCard } from "../define.js";

// EDHREC rank 4472.
//
// Rulings:
//   [2024-03-08] In a game using the shared team turns option, such as an Archenemy or Two-Headed
//     Giant game, the inherent triggered ability associated with rad counters triggers once for
//     each player on the active team that has rad counters. Each instance of that ability is
//     controlled by one of those players.
//   [2024-03-08] There is an inherent triggered ability associated with having rad counters. This
//     triggered ability has no source and is controlled by the active player. The full text of
//     this ability is "At the beginning of the precombat main phase of a player with rad counters,
//     that player mills cards equal to the number of rad counters they have. For each nonland card
//     milled this way, that player loses 1 life and removes one rad counter from themselves."
//   [2024-03-08] Any effects (such as proliferate) that interact with counters a player gets, has,
//     or loses can interact with rad counters.
//   [2024-03-08] If a player is instructed to put a card into their graveyard from their library
//     without using the word "mill," (by the effect of Rowan's Grim Search from Wilds of Eldraine,
//     for example), that card isn't a legal target for Tato Farmer's last ability.
//   [2024-03-08] Keep track of how many rad counters each player has. Potential ways to track this
//     include writing them down on paper or using dice, but any method that is clear and mutually
//     agreeable is fine.
//   [2024-03-08] Rad counters are a kind of counter that a player may have. They're not associated
//     with any specific permanents.
//   [2024-03-08] If a player has fewer cards remaining in their library than the number of rad
//     counters they have when the triggered ability resolves, they'll mill as many cards as they
//     can.
//   [2024-03-08] Rad counters don't go away as steps, phases, or turns end. They only go away when
//     an effect instructs a player to remove rad counters from themselves.
//   [2024-03-08] The cards are milled all at once, which means abilities that trigger "whenever
//     one or more nonland cards are milled" will trigger exactly once as long as at least one
//     nonland card was milled.
//   [2024-11-08] A landfall ability triggers whenever a land you control enters for any reason. It
//     triggers whenever you play a land, as well as whenever a spell or ability puts a land onto
//     the battlefield under your control.
//   [2024-11-08] A landfall ability doesn't trigger if a permanent already on the battlefield
//     becomes a land.
//   [2024-11-08] Whenever a land you control enters, each landfall ability of the permanents you
//     control will trigger. You can put them   on the stack in any order. The last ability you put
//     on the stack will be the first one to resolve (As a result, you can have those abilities
//     resolve in the order of your choosing.).

export default defineCard({
  name: "Tato Farmer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Zombie", "Mutant", "Peasant"],
  power: 1,
  toughness: 4,
  text: "Landfall — Whenever a land you control enters, you may get two rad counters.\n{T}: Put target land card in a graveyard that was milled this turn onto the battlefield tapped under your control.",
  activated: [
    {
      cost: { mana: null, tap: true },
      // "Milled", not merely put there from a library: a surveilled land
      // isn't a legal target (the 2024-03-08 ruling).
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "land", milledThisTurn: true } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true, enterTapped: true },
      resolve: null,
      text: "{T}: Put target land card in a graveyard that was milled this turn onto the battlefield tapped under your control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Get two rad counters?",
        effect: { kind: "add-player-counters", counter: "rad", amount: 2, who: "you" },
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, you may get two rad counters.",
    },
  ],
});
