import { defineCard } from "../define.js";

// The back face of Shaile, Dean of Radiance // Embrose, Dean of Shadow.
//
// The counter, then the damage, to the one target: "that creature" is target 0 throughout, so a
// 1/1 gets its counter and then dies to the 2 damage — and, if it's yours, draws you a card off
// Embrose's own trigger (it died with a +1/+1 counter on it, read as it last was, rule 603.10a).

const PING_TEXT = "{T}: Put a +1/+1 counter on another target creature, then Embrose deals 2 damage to that creature.";
const DRAW_TEXT = "Whenever a creature you control with a +1/+1 counter on it dies, draw a card.";

export default defineCard({
  name: "Embrose, Dean of Shadow",
  art: "https://cards.scryfall.io/art_crop/back/9/3/938cee8f-ac2c-49a5-9ff7-1367d0edfabe.jpg",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 4,
  toughness: 4,
  text: `${PING_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "damage", amount: 2, target: 0 },
        ],
      },
      resolve: null,
      text: PING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  faces: ["Shaile, Dean of Radiance", "Embrose, Dean of Shadow"],
});
