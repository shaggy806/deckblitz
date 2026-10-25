import { defineCard } from "../define.js";

export default defineCard({
  name: "Pull from the Deep",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to one target instant card and up to one target sorcery card from your graveyard to your hand. Exile Pull from the Deep.",
  targets: [
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "instant" } } },
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "sorcery" } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
  exileOnResolve: true,
});
