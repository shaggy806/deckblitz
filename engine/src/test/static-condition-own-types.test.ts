import { describe, expect, it } from "vitest";
import { defineCard } from "../cards/define.js";
import { stationBand } from "../cards/helpers.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { keywords, spawn, table, types } from "./harness.js";

/**
 * A static's condition about its own types reads them as they are after
 * layer 4 (rules 613.1d, 613.1f): Romulan Bird-of-Prey's "as long as this
 * Spacecraft isn't a creature, it has hexproof" is off once its station band
 * has made it one.
 */
const bird = defineCard({
  name: "Gap Test Cloaked Spacecraft",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 4,
  text: "As long as this Spacecraft isn't a creature, it has hexproof.\n8+ | Flying",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { notTypes: ["creature"] } },
      grantKeywords: ["hexproof"],
      text: "As long as this Spacecraft isn't a creature, it has hexproof.",
    },
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["flying"],
      text: "8+ | Flying",
    }),
  ],
});

describe("a static's condition about its own types", () => {
  it("is on below the band and off once the band has made it a creature", () => {
    const { game } = table({ registry: createDefaultRegistry().register(bird) });
    const id = spawn(game, bird.name);
    expect(types(game, id)).not.toContain("creature");
    expect(keywords(game, id).has("hexproof")).toBe(true);
    game.state.objects[id].counters = { charge: 8 };
    expect(types(game, id)).toContain("creature");
    expect(keywords(game, id).has("flying")).toBe(true);
    expect(keywords(game, id).has("hexproof")).toBe(false);
  });
});
