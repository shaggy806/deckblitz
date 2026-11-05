import { defineCard } from "../define.js";

/** 4/4 white Beast with "This token can't attack or block alone." — Toby, Beastie Befriender's token. */
export default defineCard({
  name: "Beast Token (Can't Attack or Block Alone)",
  tokenName: "Beast Token",
  art: "f43e18d8-529d-4d63-b627-b9d9fa4f3f38",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: "This token can't attack or block alone.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone", "cant-block-alone"],
      text: "This token can't attack or block alone.",
    },
  ],
});
