import { defineCard } from "../define.js";

// EDHREC rank 11181. Marvel Super Heroes.
//
// Weaver of Harmony's shape: an ability on the stack you control whose
// source is a creature (read as it last existed if it has left).

const COPY_TEXT =
  "{1}, {T}: Copy target activated or triggered ability you control from a creature source. You may choose new targets for the copy. (Mana abilities can't be targeted.)";

export default defineCard({
  name: "Echo, Perceptive Prodigy",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 1,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "ability", whose: "you", sourceTypes: ["creature"] }],
      effect: { kind: "copy-ability", target: 0, newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
