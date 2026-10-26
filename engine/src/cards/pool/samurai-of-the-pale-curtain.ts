import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

// Champions of Kamigawa. EDHREC rank 17011. "A permanent" is any permanent,
// tokens included, put into a graveyard from the battlefield (Garruk, Veiled
// Butcher's replacement without its filter).

const EXILE_TEXT = "If a permanent would be put into a graveyard, exile it instead.";

export default defineCard({
  name: "Samurai of the Pale Curtain",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Samurai"],
  power: 2,
  toughness: 2,
  text: `Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)\n${EXILE_TEXT}`,
  triggered: [...bushido(1)],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", from: "battlefield" },
      text: EXILE_TEXT,
    },
  ],
});
