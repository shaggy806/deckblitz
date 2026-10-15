import { defineCard } from "../define.js";

// EDHREC rank 14992.
//
// Fractal Mascot's tap-and-stun, over an artifact or creature an opponent
// controls; islandcycling is `cycling.search` (Giant Koi).

const ETB_TEXT =
  "When this creature enters, tap target artifact or creature an opponent controls. Put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Ice Flan",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Ooze"],
  power: 5,
  toughness: 4,
  cycling: { cost: "{2}", search: { subtype: "Island" } },
  text: `${ETB_TEXT}\nIslandcycling {2} ({2}, Discard this card: Search your library for an Island card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
