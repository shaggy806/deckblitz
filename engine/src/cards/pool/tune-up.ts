import { defineCard } from "../define.js";

// EDHREC rank 11118.
//
// It returns, then — once it's on the battlefield — a Vehicle becomes an
// artifact creature (Greasefang's slot-follows-the-card shape): it doesn't
// enter as a creature. No duration, so for as long as it stays.

export default defineCard({
  name: "Tune Up",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return target artifact card from your graveyard to the battlefield. If it's a Vehicle, it becomes an artifact creature.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Vehicle" } },
        then: { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "permanent" },
      },
    ],
  },
});
