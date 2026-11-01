import { defineCard } from "../define.js";

// Apocalypse (APC). Two looks in turn: you order the top three of the target
// opponent's library, then that player orders the top three of yours — they
// look at your library (`chooser: "that-player"`), the cards stay yours.

export default defineCard({
  name: "Tahngarth's Glare",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Look at the top three cards of target opponent's library, then put them back in any order. That player looks at the top three cards of your library, then puts them back in any order.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 3,
        min: 3,
        max: 3,
        destination: "library-top",
        leftover: "stay",
      },
      {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          chooser: "that-player",
          zone: "library",
          count: 3,
          min: 3,
          max: 3,
          destination: "library-top",
          leftover: "stay",
        },
      },
    ],
  },
});
