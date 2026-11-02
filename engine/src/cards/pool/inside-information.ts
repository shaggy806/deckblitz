import { defineCard } from "../define.js";

// Rulings:
//   [2026-06-29] You must follow all normal timing rules when playing a land or casting a spell for
//     cards exiled with Inside Information. For example, if an exiled card is a land card, you may
//     play it only during your main phase while the stack is empty and only if you have an
//     available land play remaining.
//   [2026-06-29] If a spell has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2026-06-29] If you cast a spell for another cost "rather than pay its mana cost," you can't
//     choose to cast it for any alternative costs. You can, however, pay additional costs. If a
//     spell has any mandatory additional costs, such as that of Stir Up Trouble, those must be
//     paid for it.

export default defineCard({
  name: "Inside Information",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile the top X cards of target opponent's library. You may play those cards this turn. If you cast a spell this way, pay life equal to its mana value rather than pay its mana cost.",
  targets: ["opponent"],
  effect: { kind: "impulse-exile", amount: "x", duration: "end-of-turn", whose: 0, payLifeManaValue: true },
});
