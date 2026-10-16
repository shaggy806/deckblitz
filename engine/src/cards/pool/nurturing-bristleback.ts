import { defineCard } from "../define.js";

// EDHREC rank 12756. The Lost Caverns of Ixalan.
//
// Its Dinosaur is a vanilla 3/3 — not the pool's "Dinosaur Token", which has
// trample — so it's a token of its own.

const ENTERS_TEXT = "When this creature enters, create a 3/3 green Dinosaur creature token.";

export default defineCard({
  name: "Nurturing Bristleback",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  cycling: { cost: "{2}", search: { subtype: "Forest" } },
  text: `${ENTERS_TEXT}\nForestcycling {2} ({2}, Discard this card: Search your library for a Forest card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Dinosaur Token", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
