import { defineCard } from "../define.js";

// The −11's control effect lasts indefinitely, not tied to Ashiok (the ruling).
export default defineCard({
  name: "Ashiok, Sculptor of Fears",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ashiok"],
  loyalty: 4,
  text: "+2: Draw a card. Each player mills two cards.\n−5: Put target creature card from a graveyard onto the battlefield under your control.\n−11: Gain control of all creatures target opponent controls.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "mill", target: "each-player", amount: 2 },
        ],
      },
      resolve: null,
      text: "+2: Draw a card. Each player mills two cards.",
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: "−5: Put target creature card from a graveyard onto the battlefield under your control.",
    },
    {
      loyaltyCost: -11,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: { kind: "gain-control-all", filter: { type: "creature" }, untilEndOfTurn: false, controlledByTarget: 0 },
      resolve: null,
      text: "−11: Gain control of all creatures target opponent controls.",
    },
  ],
});
