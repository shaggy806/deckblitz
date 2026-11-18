import { defineCard } from "../define.js";

// EDHREC rank 14916.
//
// Both abilities read the X it was cast with (rule 107.3m). The Auras enter
// unattached-by-targeting, each choosing what it enchants as it enters (rule
// 303.4f); one with nothing it could enchant isn't offered at all (303.4g,
// the card's ruling) and goes to the bottom with the rest.

const COUNTERS_TEXT = "This creature enters with X +1/+1 counters on it.";
const REVEAL_TEXT =
  "When this creature enters, reveal the top X cards of your library. You may put any number of Aura cards with mana value X or less from among them onto the battlefield. Then put all cards revealed this way that weren't put onto the battlefield on the bottom of your library in a random order.";

export default defineCard({
  name: "Knickknack Ouphe",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 1,
  toughness: 1,
  text: `${COUNTERS_TEXT}\n${REVEAL_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: COUNTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        reveal: true,
        min: 0,
        max: "x",
        destination: "battlefield",
        leftover: "bottom-random",
        filter: { subtype: "Aura", manaValue: { op: "lte", n: { amount: "x" } } },
      },
      resolve: null,
      text: REVEAL_TEXT,
    },
  ],
});
