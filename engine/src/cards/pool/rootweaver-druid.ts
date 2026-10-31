import { defineCard } from "../define.js";

// Each opponent says whether they search (rule 101.4, in turn order), then
// each who did searches: `ifDid` runs as the Druid's controller with the
// searching opponent as "that player" (`search-library`'s `who:
// "that-player"`), so "under your control" is the Druid's controller
// (`instead`'s `under: "you"`, `pick: "one"`) and the rest enter under the
// searcher's own. Each searcher shuffles their own library.
export default defineCard({
  name: "Rootweaver Druid",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 1,
  text:
    "When this creature enters, each opponent may search their library for up to three basic land cards. They each put one of those cards onto the battlefield tapped under your control and the rest onto the battlefield tapped under their control. Then each player who searched their library this way shuffles.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Search your library for up to three basic land cards?",
        effect: { kind: "sequence", effects: [] },
        ifDid: {
          kind: "search-library",
          who: "that-player",
          filter: { supertype: "basic", type: "land" },
          destination: "battlefield",
          enterTapped: true,
          min: 0,
          max: 3,
          instead: { destination: "battlefield", enterTapped: true, pick: "one", under: "you" },
        },
      },
      resolve: null,
      text: "When this creature enters, each opponent may search their library for up to three basic land cards. They each put one of those cards onto the battlefield tapped under your control and the rest onto the battlefield tapped under their control. Then each player who searched their library this way shuffles.",
    },
  ],
});
