import { defineCard } from "../define.js";

// Striding Shotcaller's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Shotcaller makes in exile (722.3c), its X
// chosen as it's cast. "Those creatures" are the targets still legal as it
// resolves; the draw happens even with none chosen.
export default defineCard({
  name: "Run the Play",
  manaCost: "{X}{G}{U}",
  colors: ["G", "U"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Put a +1/+1 counter on each of up to X target creatures. Those creatures gain flying until end of turn. Draw a card.",
  targets: [{ kind: "any-number", of: "creature", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          ],
        },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
