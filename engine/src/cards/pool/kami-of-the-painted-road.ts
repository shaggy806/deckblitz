import { defineCard } from "../define.js";

// EDHREC rank 30145. Kami of Tattered Shoji's trigger; the colour is chosen as
// it resolves.

export default defineCard({
  name: "Kami of the Painted Road",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: "Whenever you cast a Spirit or Arcane spell, this creature gains protection from the color of your choice until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: { kind: "grant-protection", target: "source", from: { choose: "color" }, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a Spirit or Arcane spell, this creature gains protection from the color of your choice until end of turn.",
    },
  ],
});
