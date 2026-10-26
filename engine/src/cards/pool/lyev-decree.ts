import { defineCard } from "../define.js";

export default defineCard({
  name: "Lyev Decree",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Detain up to two target creatures your opponents control. (Until your next turn, those creatures can't attack or block and their activated abilities can't be activated.)",
  targets: [
    { kind: "optional", of: "creature-an-opponent-controls" },
    { kind: "optional", of: { kind: "other", of: "creature-an-opponent-controls", than: { slot: 0 } } },
  ],
  effect: { kind: "sequence", effects: [{ kind: "detain", target: 0 }, { kind: "detain", target: 1 }] },
});
