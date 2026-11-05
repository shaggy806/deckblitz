import { defineCard } from "../define.js";

// The first ability exiles the card with its study counter, then moves a land
// card on to the hand: a card leaving exile is a new object without counters
// (rule 122.2), so the land gets none and the nonland card keeps its one, as
// the printed order does. The Fractal counts every nonland card you own in
// exile with a study counter, whatever exiled it (its ruling).
const EXILE =
  "{T}: Exile the top card of your library. If it's a land card, put it into your hand. Otherwise, put a study counter on it.";
const FRACTAL =
  "{4}{G}: Create a 0/0 green and blue Fractal creature token. Put a +1/+1 counter on it for each different mana value among nonland cards you own in exile with study counters on them.";

export default defineCard({
  name: "Kianne, Dean of Substance",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: `${EXILE}\n${FRACTAL}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: "you", amount: 1, withCounters: { kind: "study", amount: 1 } },
          { kind: "move-exiled-this-way", to: "hand", filter: { type: "land" } },
        ],
      },
      resolve: null,
      text: EXILE,
    },
    {
      cost: { mana: "{4}{G}", tap: false },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Fractal Token",
        count: 1,
        thenCounters: {
          kind: "+1/+1",
          amount: {
            aggregate: "distinct",
            of: "mana-value",
            filter: { notTypes: ["land"], ownedBy: "you", counters: { kind: "study", compare: { op: "gte", n: 1 } } },
            in: "exile",
          },
        },
      },
      resolve: null,
      text: FRACTAL,
    },
  ],
  faces: ["Kianne, Dean of Substance", "Imbraham, Dean of Theory"],
});
