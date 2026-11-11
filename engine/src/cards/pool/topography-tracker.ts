import { defineCard } from "../define.js";

// EDHREC rank 6348.
// Makes a Map → use "Map Token".
//
// Rulings:
//   [2023-11-10] Some spells or abilities might cause a creature to explore multiple times in a
//     row. If you reveal a nonland card when a creature explores and leave it on top of your
//     library, then the creature explores again immediately afterwards, you'll reveal the same
//     card again.
//   [2023-11-10] In some unusual cases, noncreature permanents may explore. For example, if the
//     creature card returned by Defossilize is somehow not a creature once it's on the
//     battlefield, it can still explore.
//   [2023-11-10] If a resolving spell or ability instructs a specific creature to explore but that
//     creature has left the battlefield, the creature still explores.

export default defineCard({
  name: "Topography Tracker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, create a Map token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.\")\nIf a creature you control would explore, instead it explores, then it explores again.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Map Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Map token.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      // Each instruction once (rule 614.5): two Trackers make four explorations.
      replacement: {
        event: "would-explore",
        filter: { type: "creature", controlledBy: "you" },
        instead: { modify: { times: 2 } },
      },
      text: "If a creature you control would explore, instead it explores, then it explores again.",
    },
  ],
});
