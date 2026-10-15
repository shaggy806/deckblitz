import { defineCard } from "../define.js";

// EDHREC rank 16808.
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, this creature gains flying until end of turn and you gain 1 life.";

export default defineCard({
  name: "Rabaroo Troop",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rabbit", "Kangaroo"],
  power: 3,
  toughness: 5,
  text: `${LANDFALL_TEXT}\nPlainscycling {2} ({2}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand, then shuffle.)`,
  cycling: { cost: "{2}", search: { subtype: "Plains" } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
