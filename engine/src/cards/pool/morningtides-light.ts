import { defineCard } from "../define.js";

// EDHREC rank 6675.
//
// Disorder in the Court's flicker (exiled together, back tapped under their
// owners' control at the next end step; a token doesn't come back), then a
// prevention rule on you until your next turn, then the spell exiles itself.

export default defineCard({
  name: "Morningtide's Light",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile any number of target creatures. At the beginning of the next end step, return those cards to the battlefield tapped under their owners' control.\nUntil your next turn, prevent all damage that would be dealt to you.\nExile Morningtide's Light.",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "flicker",
        target: { from: 0 },
        returnAt: "next-end-step",
        tapped: true,
        returnText: "Return the exiled cards to the battlefield tapped under their owners' control.",
      },
      { kind: "damage-rule", to: { players: "you" }, duration: "until-your-next-turn" },
    ],
  },
  exileOnResolve: true,
});
