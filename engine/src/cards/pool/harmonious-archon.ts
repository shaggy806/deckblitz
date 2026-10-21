import { defineCard } from "../define.js";

// EDHREC rank 14519. Throne of Eldraine.
//
// Rulings:
//   [2019-10-04] Effects that modify a creature's power and/or toughness, such as the effect of
//     Festive Funeral, will apply to the creature no matter when they started to take effect. The
//     same is true for any counters that change its power and/or toughness.
//   [2019-10-04] Harmonious Archon overwrites all previous effects that set a creature's base
//     power and toughness to specific values. Any power- or toughness-setting effects that start
//     to apply after Harmonious Archon enters the battlefield will overwrite this effect.
//
// Archon of the Wild Rose's layer-7b `setBasePt` static, over every non-Archon
// creature on the battlefield (any controller's) — so not Harmonious Archon
// itself. Later-timestamped setting effects win, by timestamp within 7b.

const STATIC_TEXT = "Non-Archon creatures have base power and toughness 3/3.";

export default defineCard({
  name: "Harmonious Archon",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${STATIC_TEXT}\nWhen this creature enters, create two 1/1 white Human creature tokens.`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", notSubtypes: ["Archon"] } },
      setBasePt: { power: 3, toughness: 3 },
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 1/1 white Human creature tokens.",
    },
  ],
});
