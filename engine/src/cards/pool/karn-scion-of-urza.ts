import { defineCard } from "../define.js";

// EDHREC rank 5467. The +1 is Animal Magnetism's shape — you choose the
// opponent, they choose from the revealed cards — with the card left over
// exiled under a silver counter (`leftoverCounters`). With one card in the
// library that card is the one chosen and nothing is exiled. The −1 isn't
// targeted and isn't optional: any card you own in exile with a silver
// counter, whatever put the counter there.

export default defineCard({
  name: "Karn, Scion of Urza",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Karn"],
  loyalty: 5,
  text:
    "+1: Reveal the top two cards of your library. An opponent chooses one of them. Put that card into your hand and exile the other with a silver counter on it.\n" +
    "−1: Put a card you own with a silver counter on it from exile into your hand.\n" +
    "−2: Create a 0/0 colorless Construct artifact creature token with \"This token gets +1/+1 for each artifact you control.\"",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "choose-opponent",
        then: {
          kind: "look-and-choose",
          zone: "library",
          count: 2,
          reveal: true,
          chooser: "that-player",
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "exile",
          leftoverCounters: { kind: "silver", amount: 1 },
        },
      },
      resolve: null,
      text: "+1: Reveal the top two cards of your library. An opponent chooses one of them. Put that card into your hand and exile the other with a silver counter on it.",
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exile",
        filter: { ownedBy: "you", counters: { kind: "silver", compare: { op: "gte", n: 1 } } },
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: "−1: Put a card you own with a silver counter on it from exile into your hand.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Construct Token", count: 1 },
      resolve: null,
      text: "−2: Create a 0/0 colorless Construct artifact creature token with \"This token gets +1/+1 for each artifact you control.\"",
    },
  ],
});
