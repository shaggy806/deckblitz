import { defineCard } from "../define.js";

// EDHREC rank 29414.
//
// Up to two distinct targets, returned as one event (Marang River Regent's
// shape, without its "other").

export default defineCard({
  name: "Quicksilver Geyser",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return up to two target nonland permanents to their owners' hands.",
  targets: [
    { kind: "optional", of: "nonland-permanent" },
    { kind: "optional", of: { kind: "other", of: "nonland-permanent", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});
