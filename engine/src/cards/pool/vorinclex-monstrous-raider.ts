import { defineCard } from "../define.js";

// EDHREC rank 1249. Who puts the counters decides which half applies (the
// ruling): the effect's controller, the source's controller for infect and
// toxic (rules 120.3b, 120.3g), and as a permanent enters its controller, unless
// the effect names another (the ruling). Whoever controls what they go on. Its
// own counters as it enters aren't replaced: it isn't there yet (rule 614.12).

const DOUBLE =
  "If you would put one or more counters on a permanent or player, put twice that many of each of those kinds of counters on that permanent or player instead.";
const HALF =
  "If an opponent would put one or more counters on a permanent or player, they put half that many of each of those kinds of counters on that permanent or player instead, rounded down.";

export default defineCard({
  name: "Vorinclex, Monstrous Raider",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Praetor"],
  power: 6,
  toughness: 6,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${DOUBLE}\n${HALF}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", multiplier: 2, whoPuts: "you", onPlayers: "any" },
      text: DOUBLE,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", halved: true, whoPuts: "opponent", onPlayers: "any" },
      text: HALF,
    },
  ],
});
