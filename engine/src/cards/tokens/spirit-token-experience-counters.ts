import { defineCard } from "../define.js";

const PT_TEXT = "This creature's power and toughness are each equal to the number of experience counters you have.";

/** White and black Spirit enchantment creature, its P/T its controller's experience counters (Daxos the Returned). */
export default defineCard({
  name: "Spirit Token (Experience Counters)",
  art: "03553980-53fa-4256-b478-c7e0e73e2b5b",
  colors: ["W", "B"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { playerCounters: "experience" }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
});
