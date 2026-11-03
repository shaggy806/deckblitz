import { defineCard } from "../define.js";

// "Five or more mana values": the different mana values among the cards in
// your graveyard, a land's 0 among them, read as the cast begins (rule 601.3d).
export default defineCard({
  name: "Graveyard Shift",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  flashIf: {
    condition: {
      kind: "aggregate",
      value: { aggregate: "distinct", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
      compare: { op: "gte", n: 5 },
    },
  },
  text: "This spell has flash as long as there are five or more mana values among cards in your graveyard.\nReturn target creature card from your graveyard to the battlefield.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0 },
});
