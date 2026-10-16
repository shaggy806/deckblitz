import { defineCard } from "../define.js";

// EDHREC rank 8213.
// Makes Blood → use "Blood Token".
//
// Rulings:
//   [2024-07-26] If Moonstone Eulogist and one or more creatures opponents control die at the same
//     time, its second ability will trigger for each of those creatures opponents controlled that
//     died.
//   [2025-01-24] If an effect refers to a Blood token, it means any artifact token with the
//     subtype Blood, even if it has gained other subtypes.
//   [2025-01-24] You can't sacrifice a Blood token to pay multiple costs.
//   [2025-01-24] Some triggered abilities trigger "whenever you sacrifice a Blood token." These
//     abilities trigger regardless of why you sacrificed that Blood token.

// "A creature an opponent controls" is its controller as it died (The
// Meathook Massacre's trigger); dying beside this creature still triggers it
// (leaves-the-battlefield abilities look back, rule 603.10a — the ruling).
const DIES_TEXT =
  "Whenever a creature an opponent controls dies, you create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")";
const SAC_TEXT = "Whenever you sacrifice an artifact, put a +1/+1 counter on this creature and you gain 1 life.";

export default defineCard({
  name: "Moonstone Eulogist",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat", "Warlock"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
