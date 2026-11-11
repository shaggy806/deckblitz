import { defineCard } from "../define.js";

const COPY_TEXT =
  "{1}, {T}: Copy target activated or triggered ability you control from a colorless source. You may choose new " +
  "targets for the copy. (Mana abilities can't be targeted.)";

// "From a colorless source" is the ability's source as it is — or as it last
// existed on the battlefield, once it has left (rule 113.7a) — so a land's
// ability and a colorless card's from another zone both count. The copy has
// that source too (rule 707.10b). An ability with no source (the monarch's)
// isn't a target (the ruling).
export default defineCard({
  name: "Abstruse Archaic",
  manaCost: "{4}",
  colors: [],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "ability", whose: "you", sourceFilter: { colorless: true } }],
      effect: { kind: "copy-ability", target: 0, newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
