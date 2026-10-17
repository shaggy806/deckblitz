import { defineCard } from "../define.js";

const HISTORIC = { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] } as const;

// Ruling: with two or fewer cards in that library, it goes to the bottom —
// `fromTop`'s own reading (Teferi, Hero of Dominaria).
export default defineCard({
  name: "Lost to Legend",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put target nonland historic permanent into its owner's library fourth from the top. (Artifacts, legendaries, and Sagas are historic.)",
  targets: [{ kind: "permanent", filter: { notTypes: ["land"], ...HISTORIC } }],
  effect: { kind: "put-on-library", target: 0, position: { fromTop: 4 } },
});
