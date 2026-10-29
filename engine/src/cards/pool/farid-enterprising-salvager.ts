import { defineCard } from "../define.js";

// The Brothers' War Commander (BRC). EDHREC rank 11003.
//
// The mode is chosen as it's activated, with its own target (rule 700.2b).
export default defineCard({
  name: "Farid, Enterprising Salvager",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: "Whenever a nontoken artifact you control is put into a graveyard from the battlefield, create a colorless artifact token named Scrap.\n{1}{R}, Sacrifice an artifact: Choose one —\n• Put a +1/+1 counter on Farid. It gains menace until end of turn.\n• Goad target creature.\n• Discard a card, then draw a card.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put a +1/+1 counter on Farid. It gains menace until end of turn.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
                { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
              ],
            },
          },
          {
            text: "Goad target creature.",
            targets: ["creature"],
            effect: { kind: "goad", target: 0 },
          },
          {
            text: "Discard a card, then draw a card.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard", target: "you", amount: 1 },
                { kind: "draw", amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "{1}{R}, Sacrifice an artifact: Choose one —\n• Put a +1/+1 counter on Farid. It gains menace until end of turn.\n• Goad target creature.\n• Discard a card, then draw a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "artifact" } },
      targets: [],
      effect: { kind: "create-token", token: "Scrap Token", count: 1 },
      resolve: null,
      text: "Whenever a nontoken artifact you control is put into a graveyard from the battlefield, create a colorless artifact token named Scrap.",
    },
  ],
});
