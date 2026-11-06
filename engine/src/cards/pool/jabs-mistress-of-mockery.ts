import { defineCard } from "../define.js";

// Mystery Booster Commander. Fractured Realm's doubler, narrowed to the
// permanents you control that someone else owns.
const TEXT =
  "If a triggered ability of a permanent you control but don't own triggers, that ability triggers an additional time.";

export default defineCard({
  name: "Jabs, Mistress of Mockery",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      doubleTriggersOf: { filter: { controlledBy: "you", ownedBy: "opponent" } },
      text: TEXT,
    },
  ],
});
