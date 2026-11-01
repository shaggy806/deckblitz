import { defineCard } from "../define.js";

// The whole library is revealed, then an opponent (the caster's pick, with the
// cards in view) takes one card a slot, every slot a card can fill: "if you have
// no cards of any of the specified card types, then ignore those types" (the
// ruling), and a land creature fills either of its slots.
export default defineCard({
  name: "Guided Passage",
  manaCost: "{G}{U}{R}",
  colors: ["G", "U", "R"],
  types: ["sorcery"],
  text:
    "Reveal the cards in your library. An opponent chooses from among them a creature card, a land card, and a " +
    "noncreature, nonland card. You put the chosen cards into your hand. Then shuffle.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: { librarySize: "you" },
        reveal: true,
        chooser: "an-opponent",
        min: 3,
        max: 3,
        together: {
          oneEach: [
            { label: "a creature card", filter: { type: "creature" } },
            { label: "a land card", filter: { type: "land" } },
            { label: "a noncreature, nonland card", filter: { notTypes: ["creature", "land"] } },
          ],
          text: "a creature card, a land card, and a noncreature, nonland card",
        },
        destination: "hand",
        leftover: "stay",
      },
      { kind: "shuffle-library" },
    ],
  },
});
