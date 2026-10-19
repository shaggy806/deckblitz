import { defineCard } from "../define.js";

/** 1/1 blue Fish with "This token can't be blocked." — Expendable Lackey's
 * token. */
export default defineCard({
  name: "Fish Token (Expendable Lackey)",
  art: "3b2e726b-f124-43f7-87e4-bb06bbe8e3d7",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 1,
  toughness: 1,
  text: "This token can't be blocked.",
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This token can't be blocked.",
    },
  ],
});
