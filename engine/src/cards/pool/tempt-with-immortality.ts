import { defineCard } from "../define.js";

// EDHREC rank 13651.
//
// Tempting offer (Tempt with Vengeance's shape): opponents decide in turn
// order from your left, and the creature cards the accepting ones choose
// from their own graveyards are held until all have decided, then enter
// together (rule 101.4 — the ruling). Then you return one for each opponent
// who returned one: an opponent who accepted with no creature card to return
// didn't, so the follow-up asks whether that opponent put a card onto the
// battlefield this way. Nothing is targeted (the ruling).

const RETURN = {
  kind: "look-and-choose",
  zone: "graveyard",
  min: 1,
  max: 1,
  destination: "battlefield",
  leftover: "stay",
  filter: { type: "creature" },
} as const;

export default defineCard({
  name: "Tempt with Immortality",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Tempting offer — Return a creature card from your graveyard to the battlefield. Each opponent may return a creature card from their graveyard to the battlefield. For each opponent who does, return a creature card from your graveyard to the battlefield.",
  effect: {
    kind: "sequence",
    effects: [
      RETURN,
      {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Return a creature card from your graveyard to the battlefield?",
        effect: RETURN,
        ifDid: {
          kind: "conditional",
          condition: { kind: "this-way", what: "put-onto-battlefield", who: "that-player" },
          then: RETURN,
        },
      },
    ],
  },
});
