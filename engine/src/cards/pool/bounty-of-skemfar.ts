import { defineCard } from "../define.js";

export default defineCard({
  name: "Bounty of Skemfar",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top six cards of your library. You may put up to one land card from among them onto the battlefield tapped and up to one Elf card from among them into your hand. Put the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 6,
    reveal: true,
    min: 0,
    max: 1,
    filter: { type: "land" },
    destination: "battlefield",
    enterTapped: true,
    secondPick: { filter: { subtype: "Elf" }, min: 0, max: 1, destination: "hand" },
    leftover: "bottom-random",
  },
});
