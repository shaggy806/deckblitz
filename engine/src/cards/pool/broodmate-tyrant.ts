import { defineCard } from "../define.js";

// EDHREC rank 14202. Modern Horizons 3 Commander.
//
// The token is Lathliss's 5/5 red flying Dragon. Encore is Lamentation's
// graveyard ability (`zone: "graveyard"` makes exiling the card its cost);
// each encore token is a copy of this card, so its enters trigger makes a
// Dragon of its own.
const ENTER_TEXT = "When this creature enters, create a 5/5 red Dragon creature token with flying.";
const ENCORE_TEXT =
  "Encore {5}{B}{R}{G} ({5}{B}{R}{G}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)";

export default defineCard({
  name: "Broodmate Tyrant",
  manaCost: "{4}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${ENCORE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{B}{R}{G}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: ENCORE_TEXT,
    },
  ],
});
