import { defineCard } from "../define.js";

// The five cards are revealed to everyone; the caster chooses an opponent
// (automatic with one), who picks a creature card from among them if there is
// one. That card enters under the caster's control (it's their card); the
// rest go to the caster's graveyard.
export default defineCard({
  name: "Animal Magnetism",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top five cards of your library. An opponent chooses a creature card from among them. Put that card onto the battlefield and the rest into your graveyard.",
  targets: [],
  effect: {
    kind: "choose-opponent",
    then: {
      kind: "look-and-choose",
      zone: "library",
      count: 5,
      reveal: true,
      chooser: "that-player",
      min: 1,
      max: 1,
      filter: { type: "creature" },
      destination: "battlefield",
      leftover: "graveyard",
    },
  },
});
