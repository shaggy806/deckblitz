import { defineCard } from "../define.js";

// Top-5000 #3301.
const EXILE_TEXT = "{T}: Exile target card from a graveyard.";
const SPIRITS_TEXT =
  "{6}, {T}, Sacrifice this artifact: Put each creature card exiled with this artifact onto the battlefield under your control with a flying counter on it. Each of them is a 1/1 Spirit in addition to its other types. Activate only as a sorcery.";

export default defineCard({
  name: "Ghost Vacuum",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${EXILE_TEXT}\n${SPIRITS_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      cost: { mana: "{6}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 99,
        max: 99,
        filter: { type: "creature" },
        destination: "battlefield",
        withCounters: { kind: "flying", amount: 1 },
        enterAs: { basePt: [1, 1], addSubtypes: ["Spirit"] },
        leftover: "stay",
      },
      resolve: null,
      sorcerySpeed: true,
      text: SPIRITS_TEXT,
    },
  ],
});
