import { defineCard } from "../define.js";

export default defineCard({
  name: "Samite Ministration",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to you this turn by a source of your choice. Whenever damage from a black or red source is prevented this way this turn, you gain that much life.",
  targets: [],
  effect: {
    kind: "prevent-damage-from-chosen-source",
    to: "you",
    amount: "all",
    gainLifePrevented: true,
    gainLifeFrom: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
  },
});
