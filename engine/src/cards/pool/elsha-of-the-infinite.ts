import { defineCard } from "../define.js";

// EDHREC rank 6942. The flash belongs to the permission: only a noncreature
// spell cast from the top of the library under it may begin any time (rule
// 601.3c). Every cost is still paid, alternative ones allowed (its rulings).

const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const LOOK_TEXT = "You may look at the top card of your library any time.";
const CAST_TEXT =
  "You may cast noncreature spells from the top of your library. If you cast a spell this way, you may cast it as though it had flash.";

export default defineCard({
  name: "Elsha of the Infinite",
  manaCost: "{2}{U}{R}{W}",
  colors: ["U", "R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Djinn", "Monk"],
  power: 3,
  toughness: 3,
  text: `${PROWESS_TEXT}\n${LOOK_TEXT}\n${CAST_TEXT}`,
  static: [
    { affects: { scope: "self" }, visibility: { looksAtOwnLibraryTop: true }, text: LOOK_TEXT },
    {
      affects: { scope: "self" },
      mayPlay: { from: "library-top", filter: { notTypes: ["creature"] }, flash: true },
      text: CAST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
  ],
});
