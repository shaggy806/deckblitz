import { defineCard } from "../define.js";

// EDHREC rank 21058. Kamigawa: Neon Dynasty.
//
// The land's animation is Crusher Zendikon's shape (layers 4, 5, 6 and 7b).
// The replacement is a `would-be-destroyed` static on the land the Aura
// enchants (`hostOfSource`), by an effect or by lethal damage (rule 614.6,
// the first ruling); a sacrifice isn't a destruction, so it's never replaced
// (the second). Instead the Aura is sacrificed and the land, target slot 0,
// gains indestructible until end of turn.
//
// Rulings:
//   [2022-02-18] Harmonious Emergence's replacement effect applied whether the enchanted land
//     would be destroyed due to lethal damage or any other reason.
//   [2022-02-18] Harmonious Emergence's replacement effect does not replace effects or costs that
//     require you to sacrifice the enchanted land.

const ANIMATE_TEXT = "Enchanted land is a 4/5 green Spirit creature with vigilance and haste. It's still a land.";
const INSTEAD_TEXT =
  "If enchanted land would be destroyed, instead sacrifice this Aura and that land gains indestructible until end of turn.";

export default defineCard({
  name: "Harmonious Emergence",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land you control\n${ANIMATE_TEXT}\n${INSTEAD_TEXT}`,
  targets: ["land-you-control"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      addSubtypes: ["Spirit"],
      setColors: ["G"],
      setBasePt: { power: 4, toughness: 5 },
      grantKeywords: ["vigilance", "haste"],
      text: ANIMATE_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-destroyed",
        filter: { hostOfSource: true },
        instead: {
          effect: {
            kind: "sequence",
            effects: [
              { kind: "sacrifice-source" },
              { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
            ],
          },
        },
      },
      text: INSTEAD_TEXT,
    },
  ],
});
