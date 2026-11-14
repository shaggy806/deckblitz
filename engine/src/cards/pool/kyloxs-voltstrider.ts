import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 23232. The collect-evidence cost exiles its cards with the
// Vehicle (`collectEvidenceLinked`, rule 607.2a), so the attack trigger's
// "cards exiled with it" are those. The spell is cast as the trigger
// resolves, paying its costs (`cast-now`), and goes to the bottom of its
// owner's library rather than a graveyard (`bottomAfter`).
//
// Rulings:
//   Once you've announced that you're casting a spell, players can't take actions until you've
//     finished doing so. Notably, opponents can't try to remove cards from your graveyard to
//     stop you from collecting evidence.
//   If you can't exile enough cards to meet or exceed the required mana value, you can't choose
//     to collect evidence at all.
//   You choose whether or not to cast a spell from among the exiled cards as Kylox's
//     Voltstrider's triggered ability resolves. If you do, you do so as part of the resolution of
//     that ability. You can't wait to cast it later in the turn. Timing restrictions based on the
//     card's type are ignored.

const ANIMATE = "Collect evidence 6: This Vehicle becomes an artifact creature until end of turn.";
const ATTACK =
  "Whenever this Vehicle attacks, you may cast an instant or sorcery spell from among cards exiled with it. If that spell would be put into a graveyard, put it on the bottom of its owner's library instead.";

export default defineCard({
  name: "Kylox's Voltstrider",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: `${ANIMATE}\n${ATTACK}\nCrew 2`,
  activated: [
    {
      cost: { mana: null, tap: false, collectEvidence: 6, collectEvidenceLinked: true },
      targets: [],
      effect: { kind: "become", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: ANIMATE,
    },
    crew(2),
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "exiled-with-source",
        spell: { typesAnyOf: ["instant", "sorcery"] },
        bottomAfter: true,
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
