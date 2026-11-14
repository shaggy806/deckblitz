import { defineCard } from "../define.js";

// EDHREC rank 8683.

const SURVEY =
  "Survey the Realm — Whenever Black Panther or another creature you control enters, put a +1/+1 counter on target land you control.";
const MINE =
  "Mine Vibranium — {3}: Move all +1/+1 counters from target land you control onto target creature. If one or more +1/+1 counters are moved this way, you gain that much life and draw a card.";

export default defineCard({
  name: "Black Panther, Wakandan King",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${SURVEY}\n${MINE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: ["land-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SURVEY,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["land-you-control", "creature"],
      effect: {
        kind: "move-counters",
        from: 0,
        to: 1,
        counter: "+1/+1",
        amount: "all",
        // "That much": the counters that left the land (rule 122.5's
        // removal half) — the move's own, read as an object set this way.
        ifMoved: {
          kind: "sequence",
          effects: [
            { kind: "gain-life", amount: { thisWay: "counters-removed" } },
            { kind: "draw", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: MINE,
    },
  ],
});
