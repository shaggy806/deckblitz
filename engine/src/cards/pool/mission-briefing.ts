import { defineCard } from "../define.js";

// EDHREC rank 4939. The card is chosen as this resolves, no target, after
// surveil (it may be one surveilled away); the permission is this card's.
export default defineCard({
  name: "Mission Briefing",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Surveil 2, then choose an instant or sorcery card in your graveyard. You may cast it this turn. If that spell would be put into your graveyard, exile it instead. (To surveil 2, look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  targets: [],
  effect: {
    kind: "surveil",
    amount: 2,
    then: {
      kind: "look-and-choose",
      zone: "graveyard",
      min: 1,
      max: 1,
      filter: { typesAnyOf: ["instant", "sorcery"] },
      destination: "stay",
      leftover: "stay",
      then: { kind: "grant-play", cards: 0, duration: "end-of-turn", exileAfter: true },
    },
  },
});
