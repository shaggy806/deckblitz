import { defineCard } from "../define.js";

// Saviors of Kamigawa. "Spirit or Arcane spell" is either subtype (Arcane is a
// spell subtype). The reveal is Lair Delve's: every land among the three goes
// to hand, the rest to the bottom in any order. Soulshift 2 (rule 702.46a) is
// its dies trigger; at mana value 3 it can't return itself.
const SOULSHIFT =
  "Soulshift 2 (When this creature dies, you may return target Spirit card with mana value 2 or less from your graveyard to your hand.)";
const CAST_TEXT =
  "Whenever you cast a Spirit or Arcane spell, reveal the top three cards of your library. Put all land cards revealed this way into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Elder Pine of Jukai",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: `${CAST_TEXT}\n${SOULSHIFT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtypes: ["Spirit", "Arcane"] } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: true,
        min: 3,
        max: 3,
        filter: { type: "land" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Spirit", manaValue: { op: "lte", n: 2 } } }],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: SOULSHIFT,
    },
  ],
});
