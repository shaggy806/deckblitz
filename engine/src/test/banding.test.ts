/**
 * Banding (rule 702.22): bands declared as attackers attack (702.22c-d), a
 * blocker of one member blocks the band (702.22h), and the other side
 * divides combat damage (702.22j-k). `combat/banding.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, C, keywords, life, spawn, table, zone } from "./harness.js";

const assigning = (game: Game) => game.advanceUntil((s) => s.awaiting?.kind === "assign-combat-damage" || s.turn.step === "postcombat-main");
const offer = (game: Game, player = A) => {
  const legal = game.legalActions(player).find((a) => a.kind === "assign-combat-damage");
  return legal?.kind === "assign-combat-damage" ? legal : undefined;
};
const declare = (game: Game, attackers: readonly { attacker: ObjectId; band?: number }[], defender = B) =>
  game.canDispatch({ type: "declare-attackers", player: A, attackers: attackers.map((a) => ({ ...a, defender })) });
const toAttackers = (game: Game) => game.advanceUntil((s) => s.awaiting?.kind === "attackers");
const damage = (game: Game, id: ObjectId) => game.state.objects[id]?.damageMarked ?? 0;

describe("declaring a band (rule 702.22c-d)", () => {
  it("takes creatures with banding and up to one without", () => {
    const { game } = table();
    const hero = spawn(game, "Benalish Hero");
    const wolves = spawn(game, "Timber Wolves");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    toAttackers(game);
    expect(declare(game, [{ attacker: hero, band: 1 }, { attacker: wolves, band: 1 }, { attacker: bears, band: 1 }])).toBeNull();
    expect(declare(game, [{ attacker: hero, band: 1 }, { attacker: bears, band: 1 }, { attacker: giant, band: 1 }])).toMatch(
      /can't attack as a band/,
    );
    expect(declare(game, [{ attacker: bears, band: 1 }, { attacker: giant, band: 1 }])).toMatch(/can't attack as a band/);
  });

  it("offers who can lead a band", () => {
    const { game } = table();
    const hero = spawn(game, "Benalish Hero");
    spawn(game, "Grizzly Bears");
    toAttackers(game);
    const attack = game.legalActions(A).find((a) => a.kind === "declare-attackers");
    expect(attack?.kind === "declare-attackers" ? Object.keys(attack.banding ?? {}) : []).toEqual([hero]);
  });

  it("must attack one player", () => {
    const { game } = table({ players: 3 });
    const hero = spawn(game, "Benalish Hero");
    const bears = spawn(game, "Grizzly Bears");
    toAttackers(game);
    expect(
      game.canDispatch({
        type: "declare-attackers",
        player: A,
        attackers: [
          { attacker: hero, defender: B, band: 1 },
          { attacker: bears, defender: C, band: 1 },
        ],
      }),
    ).toMatch(/one player, planeswalker or battle/);
  });
});

describe("blocking a band (rule 702.22h)", () => {
  it("blocks every member, and the attacking player divides the blocker's damage (702.22k)", () => {
    const { game, a, b } = table();
    const hero = spawn(game, "Benalish Hero");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    a.declareAttackersFn = () => [
      { attacker: hero, defender: B, band: 1 },
      { attacker: bears, defender: B, band: 1 },
    ];
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    assigning(game);
    expect(game.state.objects[hero].blockedBy).toEqual([giant]);
    expect(game.state.objects[giant].blockingAlso).toEqual([hero]);
    // Hill Giant's 3, divided by alice: all of it on the Hero.
    const o = offer(game);
    expect(o).toMatchObject({ attacker: giant, blockers: [bears, hero], blocking: true, forOpponent: true, trample: false });
    game.dispatch({ type: "assign-combat-damage", player: A, assignment: [0, 3] });
    assigning(game);
    expect(zone(game, hero)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    // Both dealt it their damage: 1 + 2.
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("is blocked as a whole even after the band's banding is gone (702.22e)", () => {
    const { game, a, b } = table();
    const hero = spawn(game, "Benalish Hero");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Junk", B);
    a.declareAttackersFn = () => [
      { attacker: hero, defender: B, band: 1 },
      { attacker: bears, defender: B, band: 1 },
    ];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    game.debugApplyEffect(A, { kind: "lose-keywords", target: 0, keywords: ["banding"], duration: "end-of-turn" }, [
      { kind: "object", object: hero },
    ]);
    expect(keywords(game, hero).has("banding")).toBe(false);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: hero }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.awaiting === null);
    expect(game.state.objects[bears].blockedBy).toEqual([wall]);
    assigning(game);
    expect(life(game, B)).toBe(20);
  });

  it("triggers \"whenever ~ blocks\" once and \"blocks a creature\" for each (509.3a-b)", () => {
    const { game, a, b } = table();
    const hero = spawn(game, "Benalish Hero");
    const bears = spawn(game, "Grizzly Bears");
    const junk = spawn(game, "Wall of Junk", B);
    const frost = spawn(game, "Wall of Frost", B);
    a.declareAttackersFn = () => [
      { attacker: hero, defender: B, band: 1 },
      { attacker: bears, defender: B, band: 1 },
    ];
    b.declareBlockersFn = () => [
      { blocker: junk, attacker: hero },
      { blocker: frost, attacker: bears },
    ];
    game.advanceUntil((s) => s.awaiting === null && s.turn.step === "declare-blockers" && s.pendingTriggers.length === 0 && s.zones.shared.stack.length > 0);
    const sources = game.state.zones.shared.stack.map((id) => game.state.objects[id].sourceObjectId);
    expect(sources.filter((s) => s === junk)).toHaveLength(1);
    expect(sources.filter((s) => s === frost)).toHaveLength(2);
  });

  it("puts the band mates in the view", () => {
    const { game, a } = table();
    const hero = spawn(game, "Benalish Hero");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: hero, defender: B, band: 1 },
      { attacker: bears, defender: B, band: 1 },
    ];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const view = game.viewFor(B);
    expect(view.objects[hero]?.band).toBeDefined();
    expect(view.objects[hero]?.band).toBe(view.objects[bears]?.band);
  });
});

describe("the defending player divides an attacker's damage (702.22j)", () => {
  it("among blockers, when one has banding", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const hero = spawn(game, "Benalish Hero", B);
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    b.declareBlockersFn = () => [
      { blocker: hero, attacker: giant },
      { blocker: bears, attacker: giant },
    ];
    assigning(game);
    expect(offer(game, B)).toMatchObject({ attacker: giant, forOpponent: true });
    expect(offer(game, A)).toBeUndefined();
    game.dispatch({ type: "assign-combat-damage", player: B, assignment: [3, 0] });
    assigning(game);
    expect(zone(game, hero)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("including how much tramples over, and the default spares the defender", () => {
    const { game, a, b } = table();
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    const hero = spawn(game, "Benalish Hero", B);
    a.declareAttackersFn = () => [{ attacker: dreadmaw, defender: B }];
    b.declareBlockersFn = () => [{ blocker: hero, attacker: dreadmaw }];
    // Bob's seat answers with the default: everything on the Hero.
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(game, hero)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(damage(game, dreadmaw)).toBe(1);
  });
});
