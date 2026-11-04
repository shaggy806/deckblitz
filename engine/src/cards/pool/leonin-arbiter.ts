import { defineCard } from "../define.js";

// Scars of Mirrodin. Paying is a special action any time its player has
// priority (rule 116.2d, `ignore-static-effect`): for them alone, for this
// Arbiter alone — a second one needs its own {2} — and for any library, as many
// times as they're told to search that turn (the rulings). It can't be paid
// while a search is resolving, since nobody has priority then.
const TEXT = "Players can't search libraries. Any player may pay {2} for that player to ignore this effect until end of turn.";

export default defineCard({
  name: "Leonin Arbiter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      cantSearchLibraries: { who: "any-player", ignoreCost: "{2}" },
      text: TEXT,
    },
  ],
});
