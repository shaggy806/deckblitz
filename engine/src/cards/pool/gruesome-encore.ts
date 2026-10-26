import { defineCard } from "../define.js";

// EDHREC rank 19246. Whip of Erebos's shape with Ashen Powder's target: the
// leave-replacement follows the creature itself (`exileIfItWouldLeave`), and
// the end-step exile is a delayed trigger (rule 603.7).
const TEXT =
  "Put target creature card from an opponent's graveyard onto the battlefield under your control. It gains haste. Exile it at the beginning of the next end step. If that creature would leave the battlefield, exile it instead of putting it anywhere else.";

export default defineCard({
  name: "Gruesome Encore",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, underYourControl: true, exileIfItWouldLeave: true },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "exile", target: 0 },
        text: "Exile the creature Gruesome Encore put onto the battlefield.",
      },
    ],
  },
});
