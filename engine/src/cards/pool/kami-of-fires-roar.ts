import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 27397. Sire of the Storm's
// Spirit or Arcane cast trigger, with Beat a Path's "can't block this turn".

const TEXT = "Whenever you cast a Spirit or Arcane spell, target creature can't block this turn.";

export default defineCard({
  name: "Kami of Fire's Roar",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
