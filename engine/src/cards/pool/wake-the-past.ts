import { defineCard } from "../define.js";

export default defineCard({
  name: "Wake the Past",
  manaCost: "{5}{R}{W}",
  colors: ["R", "W"],
  types: ["sorcery"],
  text: "Return all artifact cards from your graveyard to the battlefield. They gain haste until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-from-graveyard", filter: { type: "artifact" }, destination: "battlefield", count: "all" },
      { kind: "grant-keyword-all", filter: { thisWay: "put-onto-battlefield" }, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
