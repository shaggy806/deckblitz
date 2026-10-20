import { defineCard } from "../define.js";

// EDHREC rank 10808.
//
// +1: the Equipment goes onto the token this resolution created (`target:
// "created"`), chosen as it resolves, up to one — none is "you don't" (the
// ruling: all while the ability resolves). −3 counts Equipment as it resolves.

export default defineCard({
  name: "Nahiri, Heir of the Ancients",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nahiri"],
  loyalty: 4,
  text: "+1: Create a 1/1 white Kor Warrior creature token. You may attach an Equipment you control to it.\n−2: Look at the top six cards of your library. You may reveal a Warrior or Equipment card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.\n−3: Nahiri deals damage to target creature or planeswalker equal to twice the number of Equipment you control.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Kor Warrior Token", count: 1 },
          {
            kind: "attach",
            target: "created",
            choose: {
              filter: { subtype: "Equipment", controlledBy: "you" },
              prompt: "You may attach an Equipment you control to it",
              upTo: 1,
            },
          },
        ],
      },
      resolve: null,
      text: "+1: Create a 1/1 white Kor Warrior creature token. You may attach an Equipment you control to it.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { anyOf: [{ subtype: "Warrior" }, { subtype: "Equipment" }] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: "−2: Look at the top six cards of your library. You may reveal a Warrior or Equipment card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "damage",
        target: 0,
        amount: { countOf: { subtype: "Equipment", controlledBy: "you" }, times: 2 },
      },
      resolve: null,
      text: "−3: Nahiri deals damage to target creature or planeswalker equal to twice the number of Equipment you control.",
    },
  ],
});
