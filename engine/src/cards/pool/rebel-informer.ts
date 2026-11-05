import { defineCard } from "../define.js";

export default defineCard({
  name: "Rebel Informer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary", "Rebel"],
  power: 1,
  toughness: 2,
  text: "This creature can't be the target of white spells or abilities from white sources.\n{3}: Put target nontoken Rebel on the bottom of its owner's library.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Rebel", token: false } }],
      effect: { kind: "put-on-bottom-of-library", target: 0 },
      resolve: null,
      text: "{3}: Put target nontoken Rebel on the bottom of its owner's library.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { colors: ["W"], anyController: true, notHexproof: true },
      text: "This creature can't be the target of white spells or abilities from white sources.",
    },
  ],
});
