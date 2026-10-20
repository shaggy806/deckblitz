import { defineCard } from "../define.js";

// "That many minus one" is `plus: -1` on -1/-1 counters, applied before a
// doubler (the order that puts the fewest — rule 616.1), never below none. It
// reaches counters put as a cost (Devoted Druid's untap then costs no counter)
// and the ones a creature enters with (persist's).
const TEXT =
  "If one or more -1/-1 counters would be put on a creature you control, that many -1/-1 counters minus one are put on it instead.";

export default defineCard({
  name: "Vizier of Remedies",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: -1, counterKind: "-1/-1", filter: { type: "creature" } },
      text: TEXT,
    },
  ],
});
