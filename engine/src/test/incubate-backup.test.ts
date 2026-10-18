/**
 * Incubate (rule 701.53) and backup (rule 702.165), March of the Machine's
 * mechanics. Each test written from the rules and the cards' rulings.
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";
import { A, B, activate, cast, counters, keywords, lands, named, pt, ref, spawn, table, toHand, types } from "./harness.js";

describe("incubate", () => {
  it("makes an Incubator token with N +1/+1 counters that {2} transforms into an N/N Phyrexian artifact creature", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Converter Beast"));
    const [incubator] = named(game, "Incubator Token", A);
    expect(incubator).toBeDefined();
    expect(counters(game, incubator)).toBe(5);
    expect(types(game, incubator)).toEqual(["artifact"]);
    activate(game, incubator, 0);
    expect(types(game, incubator)).toEqual(["artifact", "creature"]);
    expect(pt(game, incubator)).toEqual({ power: 5, toughness: 5 });
    expect(printedCardName(game.state.objects[incubator])).toBe("Phyrexian Token");
  });

  it("enters with its counters, so a counter replacement applies (Doubling Season: two Incubators, ten counters each)", () => {
    const { game } = table();
    spawn(game, "Doubling Season");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Converter Beast"));
    const incubators = named(game, "Incubator Token", A);
    expect(incubators).toHaveLength(2);
    for (const id of incubators) expect(counters(game, id)).toBe(10);
  });
});

describe("backup", () => {
  it("on another creature: a +1/+1 counter and the abilities printed below, until end of turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.chooseTargetsFn = () => [ref(bears)];
    lands(game, "Plains", 5);
    const valkyrie = toHand(game, "Boon-Bringer Valkyrie");
    cast(game, valkyrie);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(counters(game, valkyrie)).toBe(0);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(counters(game, bears)).toBe(1);
  });

  it("on itself: only the counter", () => {
    const { game, a } = table();
    a.chooseTargetsFn = (_view, _source, _specs, legal) => [legal[0]?.find((r) => r.kind === "object" && game.state.objects[r.object]?.cardName === "Boon-Bringer Valkyrie") ?? null];
    lands(game, "Plains", 5);
    const valkyrie = toHand(game, "Boon-Bringer Valkyrie");
    cast(game, valkyrie);
    expect(counters(game, valkyrie)).toBe(1);
    void B;
  });
});
