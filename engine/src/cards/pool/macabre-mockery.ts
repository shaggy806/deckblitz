import { defineCard } from "../define.js";

// EDHREC rank 17852. Incandescent Soulstoke's delayed sacrifice: the delayed
// ability remembers the creature as the object it is on the battlefield, so
// one that has left by then (rule 400.7) is left be. Cast during an end step,
// it waits for the next turn's (the ruling).

const TEXT =
  "Put target creature card from an opponent's graveyard onto the battlefield under your control. It gets +2/+0 and gains haste until end of turn. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Macabre Mockery",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "sacrifice-target", target: 0 },
        text: "Sacrifice the creature Macabre Mockery put onto the battlefield.",
      },
    ],
  },
});
