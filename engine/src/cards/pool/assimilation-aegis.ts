import { equip } from "../helpers.js";
import { defineCard } from "../define.js";

// The copy is chosen among the creature cards exiled with it as the trigger
// resolves — a noncreature card exiled with it can't be (its rulings) — and
// copies the card's printed values (`ofCard`). None exiled: nothing happens.
// "That creature" is the one it's attached to as this resolves; the copy
// lasts while it stays attached to it.
const EXILE = "When this Equipment enters, exile up to one target creature until this Equipment leaves the battlefield.";
const COPY =
  "Whenever this Equipment becomes attached to a creature, for as long as this Equipment remains attached to it, that creature becomes a copy of a creature card exiled with this Equipment.";

export default defineCard({
  name: "Assimilation Aegis",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${EXILE}\n${COPY}\nEquip {2}`,
  activated: [equip("{2}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true, linked: true },
      resolve: null,
      text: EXILE,
    },
    {
      trigger: { on: "becomes-attached", who: "self", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "stay",
        leftover: "stay",
        then: { kind: "become-copy", target: "attached", of: 0, ofCard: true, until: "while-source-attached" },
      },
      resolve: null,
      text: COPY,
    },
  ],
});
