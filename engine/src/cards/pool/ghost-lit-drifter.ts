import { defineCard } from "../define.js";

// Channel is an activated ability from the hand (`zone: "hand"`), discarding
// the card as its cost. Exactly X targets, X announced first (rule 601.2b–c,
// via 602.2b) — Candelabra of Tawnos's shape.
export default defineCard({
  name: "Ghost-Lit Drifter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{2}{U}: Another target creature gains flying until end of turn.\nChannel — {X}{U}, Discard this card: X target creatures gain flying until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{2}{U}: Another target creature gains flying until end of turn.",
    },
    {
      cost: { mana: "{X}{U}", tap: false },
      targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      },
      resolve: null,
      text: "Channel — {X}{U}, Discard this card: X target creatures gain flying until end of turn.",
      zone: "hand",
    },
  ],
});
