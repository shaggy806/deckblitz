import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 32128.

export default defineCard({
  name: "Skyrider Trainee",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: "This creature has flying as long as it's enchanted.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enchanted: true } },
      grantKeywords: ["flying"],
      text: "This creature has flying as long as it's enchanted.",
    },
  ],
});
