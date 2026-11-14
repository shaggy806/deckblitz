import { defineCard } from "../define.js";

// EDHREC rank 6097.
//
// A permission on the card (rule 601.3): from any graveyard, with its
// ordinary costs and timing (the ruling — it changes where it may be cast
// from, not when). "When you cast it this turn" is a delayed triggered
// ability of the same effect (rule 603.7), which finds the spell only when
// it's cast this way (400.7h), and goes on the stack above it (the ruling):
// this creature gains the activated abilities the card has as a spell, which
// are those it had in the graveyard (the ruling), until end of turn.

const TEXT =
  "{1}: You may cast target creature card in a graveyard this turn. When you cast it this turn, this creature gains all activated abilities of that card until end of turn.";

export default defineCard({
  name: "Havengul Lich",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 4,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "grant-play",
        cards: 0,
        duration: "end-of-turn",
        whenCast: {
          effect: { kind: "grant-activated-of", target: "source", of: "trigger-object", duration: "end-of-turn" },
          text: "This creature gains all activated abilities of that card until end of turn.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
