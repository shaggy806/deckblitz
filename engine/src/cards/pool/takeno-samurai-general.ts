import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

// EDHREC rank 17738. Champions of Kamigawa (CHK).
//
// "For each point of bushido it has": every bushido instance the other
// Samurai has, added up (rule 702.45b) — a granted one too (Sensei
// Golden-Tail's training) and Fumiko's X — read live, so a Samurai that
// loses its abilities gets nothing (`grantPtPerCount.ofAffected: "bushido"`).

const LORD = "Each other Samurai creature you control gets +1/+1 for each point of bushido it has.";

export default defineCard({
  name: "Takeno, Samurai General",
  manaCost: "{5}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 3,
  text: `Bushido 2 (Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.)\n${LORD}`,
  triggered: bushido(2),
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Samurai", excludeSelf: true },
      grantPtPerCount: { ofAffected: "bushido", pt: [1, 1] },
      text: LORD,
    },
  ],
});
