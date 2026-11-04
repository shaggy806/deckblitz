import { defineCard } from "../define.js";

// The X he was cast with, 0 on any other entry (rule 107.3m). The rulings on his
// second ability are Archivist of Oghma's.

const ENTERS = "When Wan Shi Tong enters, put X +1/+1 counters on him. Then draw half X cards, rounded down.";
const SEARCH = "Whenever an opponent searches their library, put a +1/+1 counter on Wan Shi Tong and draw a card.";

export default defineCard({
  name: "Wan Shi Tong, Librarian",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flash", "flying", "vigilance"],
  text: `Flash\nFlying, vigilance\n${ENTERS}\n${SEARCH}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
          { kind: "draw", amount: { half: "x", round: "down" } },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "searches-library", who: "opponent" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: SEARCH,
    },
  ],
});
