import { defineCard } from "../define.js";

// "Land cards that player owns from exile": a `look-and-choose` over the
// exile zone with `from` — every land card that opponent owns there, however
// it was exiled (the ruling), never a face-down one (no characteristics, the
// ruling) — onto the battlefield under the caster's control.

const CAST_TEXT =
  "When you cast this spell, target opponent exiles the top four cards of their library, then you may put any number of land cards that player owns from exile onto the battlefield under your control.";

export default defineCard({
  name: "Oblivion Sower",
  manaCost: "{6}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 5,
  toughness: 8,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: 0, amount: 4 },
          {
            kind: "look-and-choose",
            zone: "exile",
            from: { target: 0 },
            filter: { type: "land" },
            min: 0,
            max: 99,
            destination: "battlefield",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
