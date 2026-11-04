import { defineCard } from "../define.js";

const TEXT = "This creature can't attack unless you sacrifice a land. (This cost is paid as attackers are declared.)";

// A cost to attack in permanents (rule 508.1h): which land is chosen once the
// declaration is made, and no requirement obliges paying it (508.1d).
export default defineCard({
  name: "Exalted Dragon",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      combatTax: { on: ["attack"], permanents: { do: "sacrifice", filter: { type: "land" }, noun: "land" } },
      text: TEXT,
    },
  ],
});
