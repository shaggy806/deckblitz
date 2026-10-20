import { defineCard } from "../define.js";

export default defineCard({
  name: "Avacyn's Memorial",
  manaCost: "{5}{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  keywords: ["indestructible"],
  text: "Indestructible\nOther legendary permanents you control have indestructible.",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { supertype: "legendary", controlledBy: "you" },
        excludeSelf: true,
      },
      grantKeywords: ["indestructible"],
      text: "Other legendary permanents you control have indestructible.",
    },
  ],
});
