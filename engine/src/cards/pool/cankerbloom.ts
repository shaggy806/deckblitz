import { defineCard } from "../define.js";

// EDHREC rank 826.
//
// Rulings:
//   [2023-02-04] You don't have to choose every permanent or player that has a counter, only the
//     ones you want to add another counter to. Since "any number" includes zero, you don't have to
//     choose any permanents at all, and you don't have to choose any players at all.
//   [2023-02-04] Players can respond to a spell or ability whose effect includes proliferating.
//     Once that spell or ability starts to resolve, however, and its controller chooses which
//     permanents and players will get new counters, it's too late for anyone to respond.
//   [2023-02-04] To proliferate, you can choose any permanent that has a counter, including ones
//     controlled by opponents. You can choose any player who has a counter, including opponents.
//     You can't choose cards in any zone other than the battlefield, even if they have counters on
//     them.
//   [2023-02-04] If a player or permanent has more than one kind of counter on it, and you choose
//     for it to get additional counters, it must get one of each kind of counter it already has.
//     You can't have it get just one kind of counter it already has and not the others.
//   [2023-02-04] An ability that triggers "Whenever you proliferate" triggers even if you chose no
//     permanents or players while doing so.
//   [2023-02-04] If a permanent ever has both +1/+1 counters and -1/-1 counters on it at the same
//     time, they're removed in pairs as a state-based action so that the permanent has only one of
//     those kinds of counters on it.

export default defineCard({
  name: "Cankerbloom",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Fungus"],
  power: 3,
  toughness: 2,
  text: "{1}, Sacrifice this creature: Choose one —\n• Destroy target artifact.\n• Destroy target enchantment.\n• Proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      // Its mode chosen as it's activated, bringing its target (rule 700.2b).
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Destroy target artifact.", targets: ["artifact"], effect: { kind: "destroy", target: 0 } },
          { text: "Destroy target enchantment.", targets: ["enchantment"], effect: { kind: "destroy", target: 0 } },
          { text: "Proliferate.", effect: { kind: "proliferate" } },
        ],
      },
      resolve: null,
      text: "{1}, Sacrifice this creature: Choose one —\n• Destroy target artifact.\n• Destroy target enchantment.\n• Proliferate.",
    },
  ],
});
