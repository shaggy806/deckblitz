import { defineCard } from "../define.js";

// EDHREC rank 3729.
//
// Rulings:
//   [2025-06-06] If a player or permanent has more than one kind of counter on it, and you choose
//     for it to get additional counters, it must get one of each kind of counter it already has.
//     You can't have it get just one kind of counter it already has and not the others.
//   [2025-06-06] Players can respond to a spell or ability whose effect includes proliferating.
//     Once that spell or ability starts to resolve, however, and its controller chooses which
//     permanents and players will get new counters, it's too late for anyone to respond.
//   [2025-06-06] You don't have to choose every permanent or player that has a counter—only the
//     ones you want to add counters to. Since "any number" includes zero, you don't have to choose
//     any permanents at all, and you don't have to choose any players at all.
//   [2025-06-06] When you proliferate, you can choose any permanent that has a counter, including
//     ones controlled by opponents. You can choose any player who has a counter, including
//     opponents. You can't choose cards in any zone other than the battlefield, even if they have
//     counters on them.
//   [2025-06-06] To move a counter from one permanent to another, the counter is removed from the
//     first permanent and put on the second. Any abilities that care about a counter being removed
//     from or put onto a permanent will apply.

export default defineCard({
  name: "Tidus, Yuna's Guardian",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: "At the beginning of combat on your turn, you may move a counter from target creature you control onto a second target creature you control.\nCheer — Whenever one or more creatures you control with counters on them deal combat damage to a player, you may draw a card and proliferate. Do this only once each turn.",
  triggered: [
    {
      // Two instances of "target" (rule 115.3): one creature may be both,
      // and then nothing moves (rule 122.5). The kind is chosen as it
      // resolves, among those on the first.
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control", "creature-you-control"],
      effect: {
        kind: "may",
        prompt: "Move a counter from the first target creature onto the second?",
        effect: { kind: "move-counters", from: 0, to: 1 },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, you may move a counter from target creature you control onto a second target creature you control.",
    },
    {
      // Once per player dealt damage (the batch), the sources matched as the
      // damage is dealt. "Do this only once each turn" is the `may`'s
      // `oncePerTurn`: a declined one doesn't use it up.
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
        combat: true,
        to: "player",
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card and proliferate?",
        oncePerTurn: true,
        effect: { kind: "sequence", effects: [{ kind: "draw", amount: 1 }, { kind: "proliferate" }] },
      },
      resolve: null,
      text: "Cheer — Whenever one or more creatures you control with counters on them deal combat damage to a player, you may draw a card and proliferate. Do this only once each turn.",
    },
  ],
});
