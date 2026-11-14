import { defineCard } from "../define.js";

// Rulings:
//   Neera, Wild Mage has received a minor update to its Oracle text to clarify its function.
//     Specifically, if you choose not to cast the nonland card, it will be put on the bottom of
//     your library along with the other revealed cards.
//   You must have legal targets to cast a spell with targets, even if you intend to put it onto
//     the bottom of your library this way.
//
// "It" is the spell, put there only while it's still that spell on the stack
// (`movedRefAct`, rule 400.7): one countered in response, or a copy (which
// ceases to exist instead, 707.10a), isn't put on the bottom, so "if you do" is
// false. The card revealed and not cast is one of the rest (`rest`).

const TEXT =
  "Whenever you cast a spell, you may put it on the bottom of its owner's library. If you do, reveal cards from the top of your library until you reveal a nonland card. You may cast that card without paying its mana cost. Then put all revealed cards not cast this way on the bottom of your library in a random order. This ability triggers only once each turn.";

export default defineCard({
  name: "Neera, Wild Mage",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Elf", "Shaman"],
  power: 2,
  toughness: 7,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put that spell on the bottom of its owner's library?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "put-on-library", target: "trigger-object", position: "bottom" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "put-on-bottom" },
              then: {
                kind: "reveal-until",
                filter: { notTypes: ["land"] },
                then: { kind: "cast-now", target: 0, free: true },
                rest: "bottom-random",
              },
            },
          ],
        },
      },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
