import { defineCard } from "../define.js";

export default defineCard({
  name: "Jeska, Thrice Reborn",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jeska"],
  loyalty: 0,
  pairing: { kind: "partner" },
  canBeCommander: true,
  text: "Jeska enters with a loyalty counter on her for each time you've cast a commander from the command zone this game.\n0: Choose target creature. Until your next turn, if that creature would deal combat damage to one of your opponents, it deals triple that damage to that player instead.\n−X: Jeska deals X damage to each of up to three targets.\nJeska, Thrice Reborn can be your commander.\nPartner (You can have two commanders if both have partner.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "loyalty", amount: { commanderCasts: "you" } } },
      text: "Jeska enters with a loyalty counter on her for each time you've cast a commander from the command zone this game.",
    },
  ],
  activated: [
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "replacement-effect",
        replacement: { event: "would-deal-damage", combat: true, instead: { modify: { times: 3 } } },
        duration: "until-your-next-turn",
        players: "each-opponent",
        fromObject: 0,
      },
      resolve: null,
      text: "0: Choose target creature. Until your next turn, if that creature would deal combat damage to one of your opponents, it deals triple that damage to that player instead.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "any-target" },
        { kind: "optional", of: { kind: "other", of: "any-target", than: { slots: [0] } } },
        { kind: "optional", of: { kind: "other", of: "any-target", than: { slots: [0, 1] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: "x", target: 0 },
          { kind: "damage", amount: "x", target: 1 },
          { kind: "damage", amount: "x", target: 2 },
        ],
      },
      resolve: null,
      text: "−X: Jeska deals X damage to each of up to three targets.",
    },
  ],
});
