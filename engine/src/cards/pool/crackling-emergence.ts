import { defineCard } from "../define.js";

// EDHREC rank 22078. Kamigawa: Neon Dynasty.
//
// Harmonious Emergence's shape: the animation on the land the Aura enchants,
// and a `would-be-destroyed` replacement on it (`hostOfSource`) that
// sacrifices the Aura and gives the land, target slot 0, indestructible
// until end of turn — by an effect or by lethal damage (rule 614.6), never a
// sacrifice.
//
// Rulings:
//   [2022-02-18] Crackling Emergence's replacement effect applies whether the enchanted land would
//     be destroyed due to lethal damage or any other reason.
//   [2022-02-18] Crackling Emergence's replacement effect does not replace effects or costs that
//     require you to sacrifice the enchanted land.

const ANIMATE_TEXT = "Enchanted land is a 3/3 red Spirit creature with haste. It's still a land.";
const INSTEAD_TEXT =
  "If enchanted land would be destroyed, instead sacrifice this Aura and that land gains indestructible until end of turn.";

export default defineCard({
  name: "Crackling Emergence",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land you control\n${ANIMATE_TEXT}\n${INSTEAD_TEXT}`,
  targets: ["land-you-control"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      addSubtypes: ["Spirit"],
      setColors: ["R"],
      setBasePt: { power: 3, toughness: 3 },
      grantKeywords: ["haste"],
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
