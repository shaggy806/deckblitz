import { defineCard } from "../define.js";

// EDHREC rank 25173.
//
// Rulings:
//   [2018-10-05] You can choose any value for X as you cast Chamber Sentry. The value chosen for X
//     doesn't directly affect the number of +1/+1 counters Chamber Sentry enters the battlefield
//     with, but it does let you pay more mana and thus spend more colors of mana to cast it.
//   [2018-10-05] If Chamber Sentry enters the battlefield without being cast, it receives no +1/+1
//     counters.
//   [2018-10-05] If an effect allows you to spend mana as though it were mana of any color to cast
//     Chamber Sentry, you consider only the actual mana spent to determine how many counters it
//     receives.
//   [2018-10-05] If another creature enters the battlefield as a copy of Chamber Sentry, consider
//     what mana was spent to cast that creature to determine how many +1/+1 counters it enters
//     with.
//   [2018-10-05] Colorless mana won't give Chamber Sentry another +1/+1 counter. Colorless is not
//     a color.
//   [2018-10-05] The value of X chosen when you activate Chamber Sentry's first activated ability
//     doesn't have to be the same value of X that you chose when you cast it.

export default defineCard({
  name: "Chamber Sentry",
  manaCost: "{X}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 0,
  text: "This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.\n{X}, {T}, Remove X +1/+1 counters from this creature: It deals X damage to any target.\n{W}{U}{B}{R}{G}: Return this card from your graveyard to your hand.",
  activated: [
    {
      cost: { mana: "{X}", tap: true, removeCounter: { kind: "+1/+1", count: "x" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: "{X}, {T}, Remove X +1/+1 counters from this creature: It deals X damage to any target.",
    },
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "{W}{U}{B}{R}{G}: Return this card from your graveyard to your hand.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } } },
      text: "This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.",
    },
  ],
});
