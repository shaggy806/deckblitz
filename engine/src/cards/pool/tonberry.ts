import { defineCard } from "../define.js";

// EDHREC rank 12295. Baloth Prime's enters replacement, with one stun counter.

const ENTER_TEXT =
  "This creature enters tapped with a stun counter on it. (If it would become untapped, remove a stun counter from it instead.)";
const KNIFE_TEXT = "Chef's Knife — During your turn, this creature has first strike and deathtouch.";

export default defineCard({
  name: "Tonberry",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Salamander", "Horror"],
  power: 2,
  toughness: 1,
  text: `${ENTER_TEXT}\n${KNIFE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true, counters: { kind: "stun", amount: 1 } },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike", "deathtouch"],
      text: KNIFE_TEXT,
    },
  ],
});
