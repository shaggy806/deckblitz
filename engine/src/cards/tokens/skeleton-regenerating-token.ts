import { defineCard } from "../define.js";

/** 1/1 black Skeleton with "{B}: Regenerate this token." — Drudge Spell's token. */
export default defineCard({
  name: "Skeleton Regenerating Token",
  art: "1abb1ab0-f8f4-44e8-b8a7-df37a8782e76",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 1,
  toughness: 1,
  text: "{B}: Regenerate this token.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this token.",
    },
  ],
});
