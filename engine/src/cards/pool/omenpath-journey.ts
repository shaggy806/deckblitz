import { defineCard } from "../define.js";

// EDHREC rank 6025.
//
// Rulings:
//   [2024-11-08] You may search your library for only one land card and exile it, if you like.
//   [2024-11-08] While in your library, a double-faced card has only the name of its front face.
//     It's not possible to reveal two of the same double-faced card this way.
//
// The lands are exiled with this enchantment (`linked`, rule 607.2a — Skyship
// Weatherlight), no two sharing a name (`together: { distinctNames }`), and
// the end step's pick is at random among those still exiled with it.
const ENTER_TEXT =
  "When this enchantment enters, search your library for up to five land cards that have different names, exile them, then shuffle.";
const END_TEXT =
  "At the beginning of your end step, choose a card at random exiled with this enchantment and put it onto the battlefield tapped.";

export default defineCard({
  name: "Omenpath Journey",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land" },
        destination: "exile",
        min: 0,
        max: 5,
        linked: true,
        together: { distinctNames: true },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "exiled-with-source",
        then: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
