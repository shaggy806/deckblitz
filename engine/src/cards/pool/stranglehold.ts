import { defineCard } from "../define.js";

// Commander 2011. An opponent can't search any library, yours included; an
// extra turn skipped is read as it would begin, so one made while this was here
// is taken as normal once it's gone (the ruling).
const NO_SEARCH = "Your opponents can't search libraries.";
const NO_EXTRA_TURN = "If an opponent would begin an extra turn, that player skips that turn instead.";

export default defineCard({
  name: "Stranglehold",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${NO_SEARCH}\n${NO_EXTRA_TURN}`,
  static: [
    { affects: { scope: "self" }, cantSearchLibraries: { who: "opponent" }, text: NO_SEARCH },
    {
      affects: { scope: "self" },
      replacement: { event: "would-begin-turn", who: "opponent", extraOnly: true },
      text: NO_EXTRA_TURN,
    },
  ],
});
