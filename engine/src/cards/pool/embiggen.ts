import { defineCard } from "../define.js";

// The bonus is counted once, as Embiggen resolves, and doesn't change after
// (the ruling): every supertype, card type and subtype the creature has then
// (`typeCountOf`) — creature types or not, never "token", which isn't a type
// (the rulings). A changeling is every creature type (rule 702.73a), a
// Brushwagg among them, so it's never a legal target.

export default defineCard({
  name: "Embiggen",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Until end of turn, target non-Brushwagg creature gets +1/+1 for each supertype, card type, and subtype it has.",
  targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Brushwagg"] } }],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { typeCountOf: 0 },
    toughness: { typeCountOf: 0 },
    duration: "end-of-turn",
  },
});
