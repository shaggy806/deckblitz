import { defineCard } from "../define.js";

// Each copy is cast if it can be, one at a time in the order its caster
// picks, as this resolves (rule 608.2g); one with no legal target is left in exile
// and ceases to exist (rule 704.5e). Then Spelltwine exiles itself.
const SPELL_TEXT =
  "Exile target instant or sorcery card from your graveyard and target instant or sorcery card from an opponent's graveyard. Copy those cards. Cast the copies if able without paying their mana costs. Exile Spelltwine.";

export default defineCard({
  name: "Spelltwine",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: SPELL_TEXT,
  exileOnResolve: true,
  targets: [
    { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
    { kind: "card-in-graveyard", whose: "opponent", filter: { typesAnyOf: ["instant", "sorcery"] } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "exile", target: 1 },
      { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true, mustCast: true },
    ],
  },
});
