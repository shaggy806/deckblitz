import { defineCard } from "../define.js";

// Final Fantasy (FIN). EDHREC rank 4462.
//
// Each player's count is half the non-God creatures **they** control, read
// for each player sacrificing (`forEachPlayer`); the choices are made in turn
// order and the creatures sacrificed at once (the ruling).
const NON_GOD_CREATURE = { type: "creature", notSubtypes: ["God"] } as const;

export default defineCard({
  name: "Zodiark, Umbral God",
  manaCost: "{B}{B}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 5,
  keywords: ["indestructible"],
  text: "Indestructible\nWhen Zodiark enters, each player sacrifices half the non-God creatures they control of their choice, rounded down.\nWhenever a player sacrifices another creature, put a +1/+1 counter on Zodiark.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "each-player",
        filter: NON_GOD_CREATURE,
        count: { half: { countOf: { ...NON_GOD_CREATURE, controlledBy: "you" }, forEachPlayer: true }, round: "down" },
      },
      resolve: null,
      text: "When Zodiark enters, each player sacrifices half the non-God creatures they control of their choice, rounded down.",
    },
    {
      trigger: { on: "sacrifice", who: "any", otherOnly: true, filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a player sacrifices another creature, put a +1/+1 counter on Zodiark.",
    },
  ],
});
