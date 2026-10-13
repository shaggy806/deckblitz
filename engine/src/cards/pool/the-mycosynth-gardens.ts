import { defineCard } from "../define.js";

// EDHREC rank 852.
//
// The copy has no duration (rule 611.2a) and copies the artifact's copiable
// values — what it copies, if it's a copy; an {X} in its cost is 0 — not its
// counters, tapped state or attachments (rule 707.2, the rulings). The land
// keeps its own status (rule 707.4) and loses its own abilities.
const COPY_TEXT = "{X}, {T}: This land becomes a copy of target nontoken artifact you control with mana value X.";

export default defineCard({
  name: "The Mycosynth Gardens",
  colors: [],
  types: ["land"],
  subtypes: ["Sphere"],
  text: `{T}: Add {C}.\n{1}, {T}: Add one mana of any color.\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{1}, {T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{X}", tap: true },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "artifact", token: false, manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: { kind: "become-copy", target: "source", of: 0 },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
