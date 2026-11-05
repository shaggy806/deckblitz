import { defineCard } from "../define.js";

// EDHREC rank 15924. A token exiled isn't a card (the ruling). A further
// activation resolving once it's the Tomb doesn't turn it back (the ruling):
// the transform is only for Profane Procession's face.
const TEXT = "{3}{W}{B}: Exile target creature. Then if there are three or more cards exiled with Profane Procession, transform it.";

export default defineCard({
  name: "Profane Procession",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{W}{B}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, linked: true },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "exiled-with-source", atLeast: 3, now: true },
                { kind: "source", filter: { name: "Profane Procession" } },
              ],
            },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Profane Procession", "Tomb of the Dusk Rose"],
  transform: true,
});
