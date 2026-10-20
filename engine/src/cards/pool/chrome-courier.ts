import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2). The kept card is the `then`'s target 0 (Town
// Greeter's shape), checked for "artifact" in the hand it went to.
const TEXT =
  "When this creature enters, reveal the top two cards of your library. Put one of them into your hand and the other into your graveyard. If you put an artifact card into your hand this way, you gain 3 life.";

export default defineCard({
  name: "Chrome Courier",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
        reveal: true,
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { type: "artifact" } },
          then: { kind: "gain-life", amount: 3 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
