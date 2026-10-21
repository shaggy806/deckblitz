import { defineCard } from "../define.js";

export default defineCard({
  name: "Bond of Revival",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to the battlefield. It gains haste until your next turn.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "until-your-next-turn" },
    ],
  },
});
