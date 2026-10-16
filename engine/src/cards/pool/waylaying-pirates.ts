import { defineCard } from "../define.js";

// EDHREC rank 21180. The Lost Caverns of Ixalan.
//
// Mechanozoa's tap-and-stun under an intervening "if" (rule 603.4): checked
// as it enters and again as it resolves. An already tapped target just gets
// the stun counter (the ruling).

const TEXT =
  "When this creature enters, if you control an artifact, tap target artifact or creature an opponent controls and put a stun counter on it.";

export default defineCard({
  name: "Waylaying Pirates",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
