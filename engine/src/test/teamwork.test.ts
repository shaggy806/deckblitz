/**
 * Teamwork N (rule 702.194a): "As an additional cost to cast this spell, you
 * may tap any number of creatures you control with total power N or more" —
 * a kicker whose cost is crew's. "Cast using teamwork" (702.194b) is the spell
 * being kicked: "choose both instead" (`kickedModes`), a bigger effect, or a
 * different target (702.194c).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, lands, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card);

describe("teamwork", () => {
  it("offers a teamwork cast only with enough total power to tap, summoning sick creatures included", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const smash = toHand(game, "HULK SMASH!");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Sol Ring", B);
    expect(offers(game, smash).some((o) => o.kind === "cast-spell" && o.kicked === true)).toBe(false);
    spawn(game, "Grizzly Bears", A, { sick: true });
    const kicked = offers(game, smash).find((o) => o.kind === "cast-spell" && o.kicked === true);
    expect(kicked).toMatchObject({ kickerKeyword: "teamwork", tapCost: { totalPower: 4 } });
    expect(kicked?.kind === "cast-spell" && kicked.castModal).toMatchObject({ minModes: 2, maxModes: 2 });
  });

  it("HULK SMASH! with teamwork: the creatures are tapped and both modes happen", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const ogre = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    const smash = toHand(game, "HULK SMASH!");
    cast(game, smash, {
      kicked: true,
      modes: [0, 1],
      tap: [bears, ogre],
      targets: [ref(ring), ref(ogre), ref(theirs)],
    });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[ogre].tapped).toBe(true);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("refuses a teamwork cast whose tapped creatures fall short of the power", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    const smash = toHand(game, "HULK SMASH!");
    expect(() =>
      cast(game, smash, { kicked: true, modes: [0, 1], tap: [bears], targets: [ref(ring), ref(bears), ref(theirs)] }),
    ).toThrow(/total power/);
  });

  it("without teamwork, one mode only", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const smash = toHand(game, "HULK SMASH!");
    expect(() => cast(game, smash, { modes: [0, 1], targets: [ref(ring), ref(bears), ref(theirs)] })).toThrow(/mode/);
    cast(game, smash, { modes: [0], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("Too Evil to Stay Dead's teamwork widens its target", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const wurm = toGraveyard(game, "Craw Wurm");
    const evil = toHand(game, "Too Evil to Stay Dead");
    expect(() => cast(game, evil, { targets: [ref(wurm)] })).toThrow();
    const g1 = spawn(game, "Hill Giant");
    const g2 = spawn(game, "Grizzly Bears");
    cast(game, evil, { kicked: true, tap: [g1, g2], targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("We Say Thee Nay! with teamwork asks for {4}, not {2}", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 5);
    const g1 = spawn(game, "Grizzly Bears");
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [{ kind: "player", player: B }], settle: false });
    const nay = toHand(game, "We Say Thee Nay!");
    cast(game, nay, { kicked: true, tap: [g1], targets: [ref(shock)], settle: false });
    expect(game.state.objects[g1].tapped).toBe(true);
    // Nay resolves and asks Shock's controller (alice) to pay: {4}.
    const asked: string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push(...(texts ?? []));
      return [];
    };
    settle(game);
    expect(asked.some((t) => t.includes("{4}"))).toBe(true);
    expect(asked.some((t) => t.includes("{2}"))).toBe(false);
    expect(zone(game, shock)).toBe("graveyard");
  });
});
