import { defineCard } from "../define.js";

// The back face of Baneblade Scoundrel. "A creature blocking this creature
// dies" looks back (rule 603.10a): the creature as it last existed, blocking
// it then — read off its last-known information.

export default defineCard({
  name: "Baneclaw Marauder",
  art: "https://cards.scryfall.io/art_crop/back/7/b/7b63f2ae-5bfd-452f-b1f5-8459bcecd3bb.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 4,
  keywords: ["nightbound"],
  text: "Whenever this creature becomes blocked, each creature blocking it gets -1/-1 until end of turn.\nWhenever a creature blocking this creature dies, that creature's controller loses 1 life.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", blockingRelation: { relation: "blocking" } },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature becomes blocked, each creature blocking it gets -1/-1 until end of turn.",
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", blockingRelation: { relation: "blocking" } } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: "Whenever a creature blocking this creature dies, that creature's controller loses 1 life.",
    },
  ],
  faces: ["Baneblade Scoundrel", "Baneclaw Marauder"],
  transform: true,
});
