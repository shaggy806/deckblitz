import { defineCard } from "../define.js";

// EDHREC rank 18442. Zara's choice from another player's hand, after the
// reveal, with Sneak Attack's `then`. Haste with no duration, so it stays if the
// creature does; the sacrifice only takes it from you (the rulings).
export default defineCard({
  name: "Treacherous Urge",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target opponent reveals their hand. You may put a creature card from it onto the battlefield under your control. That creature gains haste. Sacrifice it at the beginning of the next end step.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: 0 },
      {
        kind: "look-and-choose",
        zone: "hand",
        from: { target: 0 },
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        under: "you",
        leftover: "stay",
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "sacrifice-target", target: 0 },
              text: "Sacrifice the creature Treacherous Urge put onto the battlefield.",
            },
          ],
        },
      },
    ],
  },
});
