/**
 * Fire Covenant: "As an additional cost to cast this spell, pay X life. Fire
 * Covenant deals X damage divided as you choose among any number of target
 * creatures." The cast's edges, beyond the two cases in
 * `engine-gaps-2026-10-25.test.ts`: how much life X may be (rule 119.4), how
 * the damage may be shared (601.2d), what a target that has gone does to its
 * share (608.2b), and what can be targeted.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import { candidateActions } from "../bot/candidates.js";
import { withDivisions } from "../bot/divisions.js";
import { HeuristicBotController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, life, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/** Alice with the mana for it and Fire Covenant in hand; Bob with Grizzly
 * Bears (2/2), a Hill Giant (3/3) and a Craw Wurm (6/4). */
function board(): { game: Game; covenant: ObjectId; bears: ObjectId; giant: ObjectId; wurm: ObjectId } {
  const { game } = table();
  const bears = spawn(game, "Grizzly Bears", B);
  const giant = spawn(game, "Hill Giant", B);
  const wurm = spawn(game, "Craw Wurm", B);
  lands(game, "Swamp", 2);
  lands(game, "Mountain", 1);
  return { game, covenant: toHand(game, "Fire Covenant"), bears, giant, wurm };
}

const damageOn = (game: Game, id: ObjectId): number => game.state.objects[id]?.damageMarked ?? 0;

/** Alice passes with her spell on the stack: Bob may answer it. */
const passToBob = (game: Game): void => {
  game.dispatch({ type: "pass-priority", player: A });
};

describe("Fire Covenant", () => {
  it("shares X among three targets as chosen, and pays X life whatever it kills", () => {
    const { game, covenant, bears, giant, wurm } = board();
    cast(game, covenant, { x: 9, targets: [ref(bears), ref(giant), ref(wurm)], division: [2, 3, 4] });
    expect(life(game, A)).toBe(11);
    for (const id of [bears, giant, wurm]) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, covenant)).toBe("graveyard");
  });

  it("gives one target all of it, and damage short of lethal stays marked", () => {
    const { game, covenant, wurm } = board();
    cast(game, covenant, { x: 3, targets: [ref(wurm)] });
    expect(life(game, A)).toBe(17);
    expect(zone(game, wurm)).toBe("battlefield");
    expect(damageOn(game, wurm)).toBe(3);
  });

  it("refuses a share of nothing, shares that don't add up to X, and more targets than X", () => {
    const { game, covenant, bears, giant } = board();
    // Each target gets at least 1 (rule 601.2d).
    expect(() => cast(game, covenant, { x: 3, targets: [ref(bears), ref(giant)], division: [3, 0] })).toThrow();
    // The shares are X, no more and no less.
    expect(() => cast(game, covenant, { x: 5, targets: [ref(bears), ref(giant)], division: [2, 2] })).toThrow();
    expect(() => cast(game, covenant, { x: 5, targets: [ref(bears), ref(giant)], division: [3, 3] })).toThrow();
    // Two targets want X of 2 or more.
    expect(() => cast(game, covenant, { x: 1, targets: [ref(bears), ref(giant)], division: [1, 1] })).toThrow();
    // Nothing was paid for any of them.
    expect(life(game, A)).toBe(20);
    expect(zone(game, covenant)).toBe("hand");
  });

  it("may be cast for X = 0 at no target: no life, no damage", () => {
    const { game, covenant, bears } = board();
    cast(game, covenant, { x: 0, targets: [] });
    expect(life(game, A)).toBe(20);
    expect(zone(game, covenant)).toBe("graveyard");
    expect(damageOn(game, bears)).toBe(0);
  });

  it("can't pay more life than there is, and may pay all of it (rule 119.4)", () => {
    const { game, covenant, wurm } = board();
    game.state.players[A].life = 4;
    expect(() => cast(game, covenant, { x: 5, targets: [ref(wurm)] })).toThrow();
    expect(life(game, A)).toBe(4);
    cast(game, covenant, { x: 4, targets: [ref(wurm)] });
    // The life is paid as it's cast: at 0, state-based actions end it for
    // Alice before the spell does anything (rule 704.5a).
    expect(life(game, A)).toBe(0);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("deals a target that has left none of its share, and the rest theirs (rule 608.2b)", () => {
    const { game, covenant, bears, giant } = board();
    lands(game, "Swamp", 2, B);
    const murder = toHand(game, "Doom Blade", B);
    cast(game, covenant, { x: 5, targets: [ref(bears), ref(giant)], division: [2, 3], settle: false });
    passToBob(game);
    // Bob kills his own Bears in response: its 2 is lost, the Giant still takes 3.
    cast(game, murder, { player: B, targets: [ref(bears)], settle: false });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(15);
  });

  it("is countered on resolution with every target gone, the life still paid (rule 608.2b)", () => {
    const { game, covenant, bears } = board();
    lands(game, "Swamp", 2, B);
    const blade = toHand(game, "Doom Blade", B);
    cast(game, covenant, { x: 2, targets: [ref(bears)], settle: false });
    passToBob(game);
    cast(game, blade, { player: B, targets: [ref(bears)], settle: false });
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(zone(game, covenant)).toBe("graveyard");
  });

  it("can aim at its caster's own creature, and not at a player or a creature with hexproof", () => {
    const { game, covenant, bears } = board();
    const mine = spawn(game, "Grizzly Bears");
    const troll = spawn(game, "Gladecover Scout", B);
    expect(() => cast(game, covenant, { x: 1, targets: [{ kind: "player", player: B }] })).toThrow();
    expect(() => cast(game, covenant, { x: 1, targets: [ref(troll)] })).toThrow();
    cast(game, covenant, { x: 4, targets: [ref(mine), ref(bears)], division: [2, 2] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(16);
  });
});

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
type CastAction = Extract<Action, { type: "cast-spell" }>;

const offerOf = (game: Game, card: ObjectId): CastOffer => {
  const offer = game.legalActions(A).find((o): o is CastOffer => o.kind === "cast-spell" && o.card === card);
  if (offer === undefined) throw new Error("no cast offered");
  return offer;
};

describe("Fire Covenant's cast offer", () => {
  // The page and the bots read the offer. With the life-paid X left out of
  // it, the group "up to X" was offered at X = 0: a group of none, so the
  // page asked for X and cast the spell at no target for that much life
  // (found by hand, 2026-11-22).
  it("offers its targets up to an X of the caster's life, each count from its own least X", () => {
    const { game, covenant } = board();
    const offer = offerOf(game, covenant);
    expect(offer.targetSpecs).toEqual([{ kind: "any-number", of: "creature", max: "x" }]);
    expect(offer.targetCount).toEqual({ min: 0, max: 3 });
    expect(offer.xCost).toEqual({ maxX: 20, maxXByTargetCount: [20, 20, 20, 20], minXByTargetCount: [0, 1, 2, 3], paidInLife: true });
    expect(offer.divide).toMatchObject({ slot: 0, x: true });
  });

  it("offers X no higher than the life there is", () => {
    const { game, covenant } = board();
    game.state.players[A].life = 2;
    const offer = offerOf(game, covenant);
    // Three targets want X = 3: with 2 life, two at most.
    expect(offer.targetCount).toEqual({ min: 0, max: 2 });
    expect(offer.xCost?.maxX).toBe(2);
  });
});

describe("the bots with Fire Covenant", () => {
  /** A mid-game turn, and nothing in hand but `card`: no land to play first. */
  const midGame = (game: Game, card: ObjectId): void => {
    game.state.turn.number = 21;
    game.state.zones.perPlayer[A].hand = [card];
  };
  const v1 = (game: Game): Action => new HeuristicBotController(A, game.registry).act(game.controllerView(A));

  it("v1 pays what kills its target, never its whole life", () => {
    const { game, covenant } = board();
    midGame(game, covenant);
    const action = v1(game) as CastAction;
    expect(action).toMatchObject({ type: "cast-spell", card: covenant });
    const targets = (action.targets ?? []).filter((t) => t !== null && t.kind === "object");
    expect(targets.length).toBeGreaterThan(0);
    const lethal = targets.reduce((sum, t) => sum + (t.kind === "object" ? pt(game, t.object).toughness : 0), 0);
    expect(action.xValue).toBe(lethal);
    expect(action.xValue).toBeLessThanOrEqual(6);
    game.dispatch(action);
    settle(game);
    expect(life(game, A)).toBe(20 - lethal);
    for (const t of targets) if (t.kind === "object") expect(zone(game, t.object)).toBe("graveyard");
  });

  it("v1 holds it when the kill costs more than a third of its life", () => {
    const { game } = table();
    spawn(game, "Craw Wurm", B);
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    midGame(game, toHand(game, "Fire Covenant"));
    game.state.players[A].life = 6;
    expect(v1(game).type).toBe("pass-priority");
  });

  it("v1 pays a part of its life for Toxic Deluge, not all of it", () => {
    const { game } = table();
    for (const name of ["Grizzly Bears", "Hill Giant", "Craw Wurm"]) spawn(game, name, B);
    lands(game, "Swamp", 3);
    const deluge = toHand(game, "Toxic Deluge");
    midGame(game, deluge);
    const action = v1(game) as CastAction;
    expect(action).toMatchObject({ type: "cast-spell", card: deluge, xValue: 6 });
  });

  it("v2's candidates are all casts the engine takes, each sharing X by what kills", () => {
    const { game, covenant, bears, giant, wurm } = board();
    const offer = offerOf(game, covenant);
    const candidates = withDivisions(game.state, game.registry, offer, candidateActions(offer, A)) as CastAction[];
    expect(candidates.length).toBeGreaterThan(10);
    const toughness = (id: ObjectId): number => pt(game, id).toughness;
    for (const action of candidates) {
      const copy = Game.fromSnapshot(game.state, { registry: game.registry });
      expect(() => copy.dispatch(action), JSON.stringify(action)).not.toThrow();
      const objects = (action.targets ?? []).flatMap((t) => (t !== null && t.kind === "object" ? [t.object] : []));
      // No life for nothing: none at no target, none past what kills them.
      expect(action.xValue).toBeLessThanOrEqual(objects.reduce((sum, id) => sum + toughness(id), 0));
    }
    // All three for 9, each its lethal damage.
    const all = candidates.find((a) => a.xValue === 9 && (a.targets ?? []).length === 3);
    expect(all).toBeDefined();
    const shares = new Map((all?.targets ?? []).map((t, i) => [t !== null && t.kind === "object" ? t.object : null, all?.division?.[i]]));
    expect([shares.get(bears), shares.get(giant), shares.get(wurm)]).toEqual([2, 3, 4]);
  });
});
