import { defineCard } from "../define.js";

// EDHREC rank 19357.
// With no creature card in that library, every revealed card goes to the
// graveyard (the ruling) — `reveal-until`'s "nothing matched" case.
// `reveal-until` puts the creature onto the battlefield before the rest go to
// the graveyard, the card's own order reversed: only an "as this enters"
// replacement reading that player's graveyard could tell (its enters triggers
// go on the stack after the whole effect, seeing the same graveyard).

export default defineCard({
  name: "Telemin Performance",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target opponent reveals cards from the top of their library until they reveal a creature card. That player puts all noncreature cards revealed this way into their graveyard, then you put the creature card onto the battlefield under your control.",
  targets: ["opponent"],
  effect: {
    kind: "reveal-until",
    whose: 0,
    filter: { type: "creature" },
    put: "battlefield",
    underYourControl: true,
    rest: "graveyard",
  },
});
