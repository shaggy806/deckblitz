import { defineCard } from "../define.js";

// Legends. EDHREC rank 30194.
//
// Rulings:
//   [2004-10-04] Creatures change color as a triggered ability upon the block being declared.
//   [2004-10-04] A Leprechaun with Protection from Green can be blocked by a creature (since it is
//     not green at that time) but will not take damage from the creature (since it is green during
//     the combat damage step).
//   [2004-10-04] The change to green does not end even if the Leprechaun leaves the battlefield.
//
// One ability with two trigger events (`sameAbilityAs` — Cockatrice's shape):
// the creature it blocks, or each creature blocking it, becomes green for
// good (layer 5 — `become-color`, `"permanent"`), however the Leprechaun fares.
const TEXT = "Whenever this creature blocks or becomes blocked by a creature, that creature becomes green.";
const GREEN = { kind: "become-color", target: "trigger-object", colors: ["G"], duration: "permanent" } as const;

export default defineCard({
  name: "Aisling Leprechaun",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 1,
  text: `${TEXT} (This effect lasts indefinitely.)`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: GREEN,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: GREEN,
      resolve: null,
      text: TEXT,
    },
  ],
});
