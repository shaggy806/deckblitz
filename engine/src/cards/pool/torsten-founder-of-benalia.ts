import { defineCard } from "../define.js";

export default defineCard({
  name: "Torsten, Founder of Benalia",
  manaCost: "{5}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 7,
  toughness: 7,
  text: "When Torsten enters, reveal the top seven cards of your library. Put any number of creature and/or land cards from among them into your hand and the rest on the bottom of your library in a random order.\nWhen Torsten dies, create seven 1/1 white Soldier creature tokens.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 7,
        reveal: true,
        min: 0,
        max: 7,
        filter: { typesAnyOf: ["creature", "land"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: "When Torsten enters, reveal the top seven cards of your library. Put any number of creature and/or land cards from among them into your hand and the rest on the bottom of your library in a random order.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 7 },
      resolve: null,
      text: "When Torsten dies, create seven 1/1 white Soldier creature tokens.",
    },
  ],
});
