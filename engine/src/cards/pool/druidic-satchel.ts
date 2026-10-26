import { defineCard } from "../define.js";

const TEXT =
  "{2}, {T}: Reveal the top card of your library. If it's a creature card, create a 1/1 green Saproling creature token. If it's a land card, put that card onto the battlefield under your control. If it's a noncreature, nonland card, you gain 2 life.";

// A creature land (Dryad Arbor) does both of the first two (its ruling); a
// card that isn't a land stays on top of the library.
export default defineCard({
  name: "Druidic Satchel",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "reveal-top",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { type: "creature" } },
              then: { kind: "create-token", token: "Saproling Token", count: 1 },
            },
            {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { type: "land" } },
              then: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
            },
            {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { notTypes: ["creature", "land"] } },
              then: { kind: "gain-life", amount: 2 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
