import { defineCard } from "../define.js";

// EDHREC rank 9919.
//
// "Three counters from among creatures you control": any kinds, spread as the
// player likes, chosen as the cost is paid. A vigilance counter grants
// vigilance (rule 122.1b).

export default defineCard({
  name: "Tayam, Luminous Enigma",
  manaCost: "{1}{W}{B}{G}",
  colors: ["W", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Nightmare", "Beast"],
  power: 3,
  toughness: 3,
  text: "Each other creature you control enters with an additional vigilance counter on it.\n{3}, Remove three counters from among creatures you control: Mill three cards, then return a permanent card with mana value 3 or less from your graveyard to the battlefield.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you" },
        counters: { kind: "vigilance", amount: 1 },
      },
      text: "Each other creature you control enters with an additional vigilance counter on it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false, removeCounter: { kind: "any", count: 3, from: { type: "creature" }, among: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "return-from-graveyard",
            filter: { notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
            destination: "battlefield",
            count: 1,
          },
        ],
      },
      resolve: null,
      text: "{3}, Remove three counters from among creatures you control: Mill three cards, then return a permanent card with mana value 3 or less from your graveyard to the battlefield.",
    },
  ],
});
