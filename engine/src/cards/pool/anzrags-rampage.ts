import { defineCard } from "../define.js";

// X counts every artifact put into any graveyard from the battlefield this
// turn — tokens and ones destroyed before this spell too (the ruling) — read
// after this spell's own destruction.
export default defineCard({
  name: "Anzrag's Rampage",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all artifacts you don't control, then exile the top X cards of your library, where X is the number of artifacts that were put into graveyards from the battlefield this turn. You may put a creature card exiled this way onto the battlefield. It gains haste. Return it to your hand at the beginning of the next end step.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "artifact", controlledBy: "opponent" } },
      {
        kind: "exile-from-library",
        amount: { turnHistory: "to-graveyard", who: "each-player", from: ["battlefield"], filter: { type: "artifact" } },
      },
      {
        kind: "look-and-choose",
        zone: "exile",
        min: 0,
        max: 1,
        filter: { thisWay: "exiled", type: "creature" },
        destination: "battlefield",
        leftover: "stay",
      },
      { kind: "grant-keyword-all", filter: { thisWay: "put-onto-battlefield" }, keyword: "haste", duration: "permanent" },
      {
        kind: "delayed-trigger",
        at: { step: "end" },
        about: "put-onto-battlefield",
        effect: { kind: "return-to-hand", target: 0 },
        text: "Return it to your hand.",
      },
    ],
  },
});
