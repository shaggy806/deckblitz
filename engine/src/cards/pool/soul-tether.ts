import { defineCard } from "../define.js";

// The prepare spell of Konstrari Improviser and Woodwork Prodigy (rule 722):
// no card of its own, only ever cast as the copy a prepared one makes in
// exile (722.3c).
export default defineCard({
  name: "Soul Tether",
  manaCost: "{2}{R/G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: 'Create a Heartwood token. (It\'s a red and green artifact with "{T}: Add {R} or {G}.")',
  effect: { kind: "create-token", token: "Heartwood Token", count: 1 },
});
