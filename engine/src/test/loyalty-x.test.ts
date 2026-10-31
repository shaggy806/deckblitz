/**
 * "−X" loyalty costs (rules 606.4, 606.6, 107.3a): the controller announces X
 * as the ability is activated — anything from 0 to the loyalty the
 * planeswalker has, offered as the activation's `xCost` like an `{X}` mana
 * cost's — and that many loyalty counters are removed as the cost. The
 * ability's X is that value (107.3k), read by its effect as `amount: "x"` or
 * a filter's `n: "x"`. Chandra Nalaar (a targeted X), Chandra, Flamecaller
 * (each creature) and Tezzeret the Seeker (a search's mana value).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { candidateActions } from "../bot/candidates.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  counters,
  life,
  loyalty,
  pickFromZone,
  pt,
  toHand,
  hand,
  tokensNamed,
  spawn,
  table,
  toLibrary,
  zone,
} from "./harness.js";

type ActivateAbilityLegal = Extract<LegalAction, { kind: "activate-ability" }>;

/** The offer of `source`'s "−X" ability. */
function minusXOffer(game: Game, source: ObjectId): ActivateAbilityLegal | undefined {
  return game
    .legalActions(A)
    .find(
      (o): o is ActivateAbilityLegal => o.kind === "activate-ability" && o.source === source && o.loyalty === "-x",
    );
}

describe("a −X loyalty cost", () => {
  it("is offered with X up to the loyalty it has", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra Nalaar");
    spawn(game, "Grizzly Bears", B);
    expect(counters(game, chandra, "loyalty")).toBe(6);
    expect(minusXOffer(game, chandra)?.xCost).toEqual({ maxX: 6 });
  });

  it("removes X loyalty counters and deals X damage", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra Nalaar");
    const giant = spawn(game, "Hill Giant", B);
    const before = game.events.length;
    loyalty(game, chandra, "-x", { x: 3, targets: [{ kind: "object", object: giant }] });
    expect(counters(game, chandra, "loyalty")).toBe(3);
    expect(zone(game, giant)).toBe("graveyard");
    // The cost removes counters (606.4): a counters-removed trigger sees it.
    expect(
      game.events
        .slice(before)
        .some((e) => e.type === "counter-removed" && e.object === chandra && e.counter === "loyalty" && e.amount === 3),
    ).toBe(true);
  });

  it("can't remove more loyalty than it has (606.6)", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra Nalaar");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => loyalty(game, chandra, "-x", { x: 7, targets: [{ kind: "object", object: bears }] })).toThrow(
      /does not have 7 loyalty/,
    );
    expect(counters(game, chandra, "loyalty")).toBe(6);
  });

  it("may spend every counter, and the planeswalker goes (704.5i)", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra Nalaar");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, chandra, "-x", { x: 6, targets: [{ kind: "object", object: bears }] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, chandra)).toBe("graveyard");
  });

  it("may be activated for X = 0 (its ruling)", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra Nalaar");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, chandra, "-x", { x: 0, targets: [{ kind: "object", object: bears }] });
    expect(counters(game, chandra, "loyalty")).toBe(6);
    expect(zone(game, bears)).toBe("battlefield");
    // Still its one loyalty ability this turn (606.3).
    expect(minusXOffer(game, chandra)).toBeUndefined();
  });

  it("is a loyalty ability: once a turn (606.3)", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra Nalaar");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, chandra, "-x", { x: 1, targets: [{ kind: "object", object: bears }] });
    expect(() => loyalty(game, chandra, 1, { targets: [{ kind: "player", player: B }] })).toThrow(/already been activated/);
    expect(life(game, B)).toBe(20);
  });

  it("reaches an untargeted effect's amount (Chandra, Flamecaller)", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Flamecaller");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm");
    loyalty(game, chandra, "-x", { x: 2 });
    expect(counters(game, chandra, "loyalty")).toBe(2);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });

  it("reaches a filter read as it resolves (Tezzeret the Seeker)", () => {
    const { game, a } = table();
    const tezzeret = spawn(game, "Tezzeret the Seeker");
    const ring = toLibrary(game, "Sol Ring");
    const stone = toLibrary(game, "Mind Stone");
    const wurmcoil = toLibrary(game, "Wurmcoil Engine");
    const seen = pickFromZone(a, stone);
    loyalty(game, tezzeret, "-x", { x: 2 });
    expect(counters(game, tezzeret, "loyalty")).toBe(2);
    expect(zone(game, stone)).toBe("battlefield");
    expect(seen.offered).toContain(ring);
    expect(seen.offered).not.toContain(wurmcoil);
  });

  it("gives the bot each X from 1 up as a candidate", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Flamecaller");
    spawn(game, "Grizzly Bears", B);
    const offer = minusXOffer(game, chandra);
    expect(offer).toBeDefined();
    const xs = candidateActions(offer!, A).map((c) => (c.type === "activate-ability" ? c.xValue : undefined));
    expect(xs).toEqual([4, 3, 2, 1]);
  });
});

describe("the proving cards' other abilities", () => {
  it("Chandra Nalaar's −8 deals 10 to a player and each creature they control", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra Nalaar");
    game.state.objects[chandra].counters.loyalty = 8;
    const wurm = spawn(game, "Craw Wurm", B);
    const mine = spawn(game, "Craw Wurm");
    loyalty(game, chandra, -8, { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(10);
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("Chandra, Flamecaller's +1 makes two hasty 3/1s and her 0 draws one more than discarded", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Flamecaller");
    loyalty(game, chandra, 1);
    expect(tokensNamed(game, "3/1 Red Elemental Token (Haste)", A)).toBe(2);
    const { game: g2 } = table();
    const c2 = spawn(g2, "Chandra, Flamecaller");
    const before = hand(g2).length;
    toHand(g2, "Wastes");
    toHand(g2, "Wastes");
    loyalty(g2, c2, 0);
    expect(hand(g2).length).toBe(before + 3);
  });

  it("Tezzeret's −5 makes his controller's artifacts 5/5 artifact creatures", () => {
    const { game } = table();
    const tezzeret = spawn(game, "Tezzeret the Seeker");
    game.state.objects[tezzeret].counters.loyalty = 5;
    const ring = spawn(game, "Sol Ring");
    loyalty(game, tezzeret, -5);
    expect(pt(game, ring)).toEqual({ power: 5, toughness: 5 });
  });
});
