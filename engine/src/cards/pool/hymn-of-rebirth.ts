import { defineCard } from "../define.js";

// EDHREC rank 24750.

export default defineCard({
  name: "Hymn of Rebirth",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: "Put target creature card from a graveyard onto the battlefield under your control.",
  targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
});
