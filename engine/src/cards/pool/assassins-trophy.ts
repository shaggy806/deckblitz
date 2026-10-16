import { defineCard } from "../define.js";

/** The compensating search is the *destroyed* permanent's controller's, and
 * theirs to decline: an `each-player-may` of `who: { controllerOfTarget }`,
 * which reads last-known information (rule 608.2h), so the target still names
 * its controller after it has gone. */
export default defineCard({
  name: "Assassin's Trophy",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text:
    "Destroy target permanent an opponent controls. Its controller may search their library " +
    "for a basic land card, put it onto the battlefield, then shuffle.",
  targets: [{ kind: "permanent", whose: "opponent", filter: {} }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        // "Its controller **may** search": their choice (`each-player-may`),
        // so declining neither searches nor shuffles their library.
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
    ],
  },
});
