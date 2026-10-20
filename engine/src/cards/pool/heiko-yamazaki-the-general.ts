import { defineCard } from "../define.js";

// EDHREC rank 9902.

export default defineCard({
  name: "Heiko Yamazaki, the General",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nWhenever a Samurai or Warrior you control attacks alone, you may cast target artifact card from your graveyard this turn.",
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { subtypes: ["Samurai", "Warrior"] } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: { kind: "grant-graveyard-cast", target: 0 },
      resolve: null,
      text: "Whenever a Samurai or Warrior you control attacks alone, you may cast target artifact card from your graveyard this turn.",
    },
  ],
});
