import { defineCard } from "../define.js";

// Cipher (rule 702.99): `cipher: true`.

export default defineCard({
  name: "Arcane Heist",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "You may cast target instant or sorcery card from an opponent's graveyard without paying its mana cost. If that spell would be put into their graveyard, exile it instead.\nCipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
  cipher: true,
});
