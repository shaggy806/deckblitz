import { defineCard } from "../define.js";

// EDHREC rank 11201.

const EVEN_TEXT = "As long as Kianne's power is even, you may cast noncreature spells as though they had flash.";
const ODD_TEXT = "As long as Kianne's power is odd, you may cast creature spells as though they had flash.";
const DRAW_TEXT = "Whenever you draw a card, put a +1/+1 counter on Kianne.";

export default defineCard({
  name: "Kianne, Corrupted Memory",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 2,
  text: `${EVEN_TEXT}\n${ODD_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { powerParity: "even" } },
      castAsThoughFlash: { notTypes: ["creature"] },
      text: EVEN_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { powerParity: "odd" } },
      castAsThoughFlash: { type: "creature" },
      text: ODD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
