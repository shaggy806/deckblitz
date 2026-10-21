import { defineCard } from "../define.js";

// EDHREC rank 12376. One counter for a creature that's both a Wolf and a
// Werewolf (the ruling: one `subtypes` OR filter). Arlinn herself isn't a
// creature, so "other" entering permanents are every one this can apply to.

export default defineCard({
  name: "Arlinn, Voice of the Pack",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Arlinn"],
  loyalty: 7,
  text: "Each creature you control that's a Wolf or a Werewolf enters with an additional +1/+1 counter on it.\n−2: Create a 2/2 green Wolf creature token.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you", subtypes: ["Wolf", "Werewolf"] },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: "Each creature you control that's a Wolf or a Werewolf enters with an additional +1/+1 counter on it.",
    },
  ],
  activated: [
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: "−2: Create a 2/2 green Wolf creature token.",
    },
  ],
});
