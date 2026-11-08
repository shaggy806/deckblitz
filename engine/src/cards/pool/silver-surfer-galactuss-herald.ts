import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When Silver Surfer enters, you may search your library for a card named Galactus, Devourer of Worlds, reveal it, put it into your hand, then shuffle.";
const DAMAGE_TEXT =
  "Whenever Silver Surfer deals combat damage to a player, until the end of your next turn, target creature attacks that player each combat if able.";

export default defineCard({
  name: "Silver Surfer, Galactus's Herald",
  manaCost: "{5}",
  colors: [],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Alien", "Hero"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\n" + ENTERS_TEXT + "\n" + DAMAGE_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Galactus, Devourer of Worlds?",
        effect: { kind: "search-library", filter: { name: "Galactus, Devourer of Worlds" }, destination: "hand", min: 0, max: 1, reveal: true },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "restrict",
        target: 0,
        restrictions: [{ kind: "must-attack", at: "trigger-player" }],
        duration: "until-end-of-your-next-turn",
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
