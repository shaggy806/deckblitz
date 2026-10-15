import { defineCard } from "../define.js";

// EDHREC rank 21966.
//
// Champions of the Shoal's tap-and-stun; "up to one target" may choose none.

const ENTER_TEXT = "When this creature enters, tap up to one target creature and put a stun counter on it.";

export default defineCard({
  name: "Utrom Scientists",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Utrom", "Robot", "Scientist"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
