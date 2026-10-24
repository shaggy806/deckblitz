import { defineCard } from "../define.js";

// An empty filter: the legend rule applies to no permanent, anyone's, while
// this is on the battlefield (`legendRuleOff`'s doc).
export default defineCard({
  name: "Mirror Gallery",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "The \"legend rule\" doesn't apply.",
  static: [
    {
      affects: { scope: "filter", filter: {} },
      legendRuleOff: true,
      text: "The \"legend rule\" doesn't apply.",
    },
  ],
});
