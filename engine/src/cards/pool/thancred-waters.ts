import { defineCard } from "../define.js";

// EDHREC rank 8111.

export default defineCard({
  name: "Thancred Waters",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 5,
  keywords: ["flash"],
  text: "Flash\nRoyal Guard — When Thancred Waters enters, another target legendary permanent you control gains indestructible for as long as you control Thancred Waters.\nWhenever you cast a noncreature spell, Thancred Waters gains indestructible until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { supertype: "legendary" } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "while-you-control-source" },
      resolve: null,
      text: "Royal Guard — When Thancred Waters enters, another target legendary permanent you control gains indestructible for as long as you control Thancred Waters.",
    },
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a noncreature spell, Thancred Waters gains indestructible until end of turn.",
    },
  ],
});
