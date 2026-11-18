import { defineCard } from "../define.js";

// Streets of New Capenna Commander (NCC). EDHREC rank 16125.
//
// "Exile it if it's an instant or sorcery card" asks of the card in the
// graveyard as the ability resolves (`object-matches` with `now`): a
// face-down creature has no types (rule 708.2), so the creature as it last
// existed can't say; the card it became, revealed as it left (708.9), can. A
// dies trigger finds that card there (rule 603.10a), and nothing once it has
// moved on (400.7). Cast only: it's an instant or sorcery card.
const CAST = "Whenever you cast an instant or sorcery spell from your hand, manifest the top card of your library.";
const DIES =
  "Whenever a face-down creature you control dies, exile it if it's an instant or sorcery card. You may cast that card until the end of your next turn.";

export default defineCard({
  name: "Cryptic Pursuit",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  text: `${CAST} (Put that card onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)\n${DIES}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: CAST,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", faceDown: true } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "object-matches", object: "trigger-object", filter: { typesAnyOf: ["instant", "sorcery"] }, now: true },
        then: { kind: "exile", target: "trigger-object", mayPlay: { duration: "until-end-of-your-next-turn" } },
      },
      resolve: null,
      text: DIES,
    },
  ],
});
