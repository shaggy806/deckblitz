/**
 * Phasing (rule 702.26): a phased-out permanent is treated as though it
 * doesn't exist (702.26b) without changing zones (702.26d), what's attached
 * to it phases out with it (702.26g), and it phases in as the untap step of
 * the player who controlled it begins (502.1) — or, phased out "until"
 * something, only then (610.4). Plus the player half of Teferi's Protection:
 * "your life total can't change" (119.7–8) and protection from everything
 * (702.16j).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const phasedOut = (game: Game, id: ObjectId): boolean =>
  game.state.objects[id].zone === "phased-out" && game.state.objects[id].phasedOut !== undefined;

/** Phase `ids` out as `by`'s effect would. */
function phaseOut(game: Game, ids: readonly ObjectId[], by = A): void {
  game.debugApplyEffect(by, { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "phase-out", target: 0 } }, ids.map(ref));
  settle(game);
}

describe("phasing out (rule 702.26b–d)", () => {
  it("leaves the battlefield's list without changing zones, keeping counters, status and stint", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    game.state.objects[bears].counters["+1/+1"] = 2;
    const stint = game.state.objects[bears].zoneChangeCount;
    phaseOut(game, [bears]);
    expect(phasedOut(game, bears)).toBe(true);
    expect(game.battlefield).not.toContain(bears);
    expect(game.state.phasedOut).toContain(bears);
    expect(counters(game, bears)).toBe(2);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[bears].zoneChangeCount).toBe(stint);
    // No leaves-the-battlefield event: the zone never changed.
    expect(game.state.eventLog.some((e) => e.type === "permanent-left-battlefield" && e.object === bears)).toBe(false);
    expect(game.state.eventLog.some((e) => e.type === "permanents-phased-out" && e.objects.includes(bears))).toBe(true);
  });

  it("isn't destroyed by a wrath, nor counted, nor targetable (702.26b's examples)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const other = spawn(game, "Grizzly Bears", A);
    phaseOut(game, [bears]);
    // "Draw a card for each creature you control" counts one.
    const drawn = game.state.players[A].cardsDrawnThisTurn;
    game.debugApplyEffect(A, { kind: "draw", amount: { countOf: { type: "creature", controlledBy: "you" } } });
    expect(game.state.players[A].cardsDrawnThisTurn - drawn).toBe(1);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } });
    settle(game);
    expect(zone(game, other)).toBe("graveyard");
    expect(phasedOut(game, bears)).toBe(true);
    // Not a legal target while phased out: Murder has nothing to aim at.
    lands(game, "Swamp", 3);
    const murder = toHand(game, "Murder");
    const offered = game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === murder);
    expect(offered).toBe(false);
  });

  it("makes a spell targeting it fizzle (its target is illegal as it resolves)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(bears)], settle: false });
    phaseOut(game, [bears], B);
    expect(phasedOut(game, bears)).toBe(true);
    expect(graveyard(game, B)).not.toContain(bears);
  });

  it("takes what's attached to it along, indirectly, and they phase in together still attached (702.26g)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 2);
    const pacifism = toHand(game, "Pacifism");
    cast(game, pacifism, { targets: [ref(bears)] });
    expect(game.state.objects[pacifism].attachedTo).toBe(bears);
    phaseOut(game, [bears]);
    expect(phasedOut(game, pacifism)).toBe(true);
    expect(game.state.objects[pacifism].phasedOut?.with).toBe(bears);
    // Nothing attached to nothing: no state-based action touched the Aura.
    expect(graveyard(game, A)).not.toContain(pacifism);
    nextTurn(game); // bob's turn: nothing phases in.
    expect(phasedOut(game, bears)).toBe(true);
    nextTurn(game); // alice's untap step.
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, pacifism)).toBe("battlefield");
    expect(game.state.objects[pacifism].attachedTo).toBe(bears);
  });

  it("an Equipment phased out on its own phases in unattached once its creature has left (702.26i)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const sword = spawn(game, "Bonesplitter", A);
    game.state.objects[sword].attachedTo = bears;
    phaseOut(game, [sword]);
    expect(phasedOut(game, sword)).toBe(true);
    expect(phasedOut(game, bears)).toBe(false);
    destroy(game, bears);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, sword)).toBe("battlefield");
    expect(game.state.objects[sword].attachedTo).toBeNull();
  });

  it("removes an attacker from combat (506.4)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.objects[bears].attacking !== null && s.priority.holder === A);
    expect(game.state.objects[bears].attacking).toBe(B);
    phaseOut(game, [bears]);
    expect(game.state.objects[bears].attacking).toBeNull();
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20);
  });

  it("keeps a token in existence (702.26d)", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "2/2 Blue Bird Token", count: 1 });
    settle(game);
    const bird = game.battlefield.find((id) => game.state.objects[id].cardName === "2/2 Blue Bird Token") as ObjectId;
    phaseOut(game, [bird]);
    settle(game);
    expect(game.state.objects[bird]).toBeDefined();
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bird)).toBe("battlefield");
  });

  it("phasing in fires no enters trigger, and the creature can attack (its history goes on — 702.26d)", () => {
    const { game, a } = table();
    spawn(game, "Soul Warden", A);
    const bears = spawn(game, "Grizzly Bears", A);
    phaseOut(game, [bears]);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[bears].summoningSick).toBe(false);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
  });

  it("phases in before the untap: a tapped permanent comes back and untaps (502.1, 502.3)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    phaseOut(game, [bears]);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("loses its damage at cleanup while phased out (514.2)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    game.state.objects[bears].damageMarked = 1;
    phaseOut(game, [bears]);
    nextTurn(game);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("doesn't trigger an O-Ring's leave: the exiled card stays exiled (the rulings)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    pickTargets(a, bears);
    const ring = toHand(game, "Banishing Light");
    cast(game, ring);
    expect(zone(game, bears)).toBe("exile");
    phaseOut(game, [ring]);
    expect(zone(game, bears)).toBe("exile");
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    // It still leaves for real later, and the card comes back then.
    destroy(game, ring);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("ends a 'for as long as' effect tracking it, for good (702.26f)", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const dragon = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSource: true }, [ref(theirs)], {
      source: dragon,
    });
    settle(game);
    expect(game.state.objects[theirs].controller).toBe(A);
    phaseOut(game, [dragon]);
    expect(game.state.objects[theirs].controller).toBe(B);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, dragon)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(B);
  });

  it("a stolen creature whose control effect ended while it was out phases in under its owner (the rulings)", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: true }, [ref(theirs)]);
    settle(game);
    expect(game.state.objects[theirs].controller).toBe(A);
    phaseOut(game, [theirs]);
    expect(game.state.objects[theirs].phasedOut?.controller).toBe(A);
    nextTurn(game); // bob's untap step: not his to phase in.
    expect(phasedOut(game, theirs)).toBe(true);
    nextTurn(game); // alice's untap step: in, under bob.
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(B);
  });
});

describe("the phasing keyword (rule 702.26a)", () => {
  it("phases a permanent out and back in on alternate untap steps of its controller", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    game.state.objects[bears].modifiers.push({ power: 0, toughness: 0, keywords: ["phasing"], untilEndOfTurn: false });
    nextTurn(game); // bob's: nothing
    expect(zone(game, bears)).toBe("battlefield");
    nextTurn(game); // alice's: out
    expect(phasedOut(game, bears)).toBe(true);
    nextTurn(game); // bob's
    expect(phasedOut(game, bears)).toBe(true);
    nextTurn(game); // alice's: in
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Oubliette — phased out until it leaves (rule 610.4)", () => {
  it("holds the creature through untap steps and lets it go, tapped, as Oubliette leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const oubliette = enter(game, "Oubliette");
    expect(phasedOut(game, bears)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(phasedOut(game, bears)).toBe(true);
    destroy(game, oubliette);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    // Tapped as it phased in, not becoming tapped: no event for it.
    expect(game.state.eventLog.some((e) => e.type === "permanent-tapped" && e.object === bears)).toBe(false);
  });

  it("does nothing if Oubliette has left before its trigger resolves (610.4c)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const oubliette = enter(game, "Oubliette", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(oubliette)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("keeps the creature out while Oubliette is itself phased out — it hasn't left", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const oubliette = enter(game, "Oubliette");
    phaseOut(game, [oubliette]);
    expect(phasedOut(game, bears)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    // Oubliette is back; the Bears never came back with it.
    expect(zone(game, oubliette)).toBe("battlefield");
    expect(phasedOut(game, bears)).toBe(true);
  });
});

describe("Teferi's Protection — a player's life can't change, protection from everything", () => {
  it("phases out everything you control and shields you until your next turn", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const plains = lands(game, "Plains", 3);
    cast(game, toHand(game, "Teferi's Protection"));
    expect(phasedOut(game, bears)).toBe(true);
    for (const land of plains) expect(phasedOut(game, land)).toBe(true);
    expect(game.state.zones.shared.exile.some((id) => game.state.objects[id].cardName === "Teferi's Protection")).toBe(
      true,
    );
    // Damage to A is prevented; losing and gaining life do nothing.
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 3 }, [ref(A)]);
    game.debugApplyEffect(B, { kind: "lose-life", who: "each-opponent", amount: 2 });
    game.debugApplyEffect(A, { kind: "gain-life", amount: 5 });
    settle(game);
    expect(life(game, A)).toBe(20);
    // Not a legal target of anyone's spell.
    nextTurn(game); // bob's turn, his main phase
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const targets = game
      .legalActions(B)
      .filter((o) => o.kind === "cast-spell" && o.card === bolt)
      .flatMap((o) => (o.kind === "cast-spell" ? (o.targetOptions?.[0] ?? []) : []));
    expect(targets.some((t) => t.kind === "player" && t.player === A)).toBe(false);
    void b;
    nextTurn(game); // alice's: everything is back, and the shield is gone.
    expect(zone(game, bears)).toBe("battlefield");
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 3 }, [ref(A)]);
    settle(game);
    expect(life(game, A)).toBe(17);
  });

  it("takes a Curse off the protected player (702.16c, 704.5m)", () => {
    const { game } = table();
    const curse = spawn(game, "Curse of Opulence", B);
    game.state.objects[curse].attachedToPlayer = A;
    game.state.objects[curse].attachedTo = null;
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Teferi's Protection"));
    expect(graveyard(game, B)).toContain(curse);
  });

  it("shows a phased-out permanent in the view as phased out, apart from the battlefield", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    game.state.objects[bears].counters["+1/+1"] = 1;
    phaseOut(game, [bears]);
    const view = game.viewFor(B);
    expect(view.zones.battlefield).not.toContain(bears);
    expect(view.zones.phasedOut).toContain(bears);
    expect(view.objects[bears]?.phasedOut).toBe(true);
    expect(view.objects[bears]?.zone).toBe("battlefield");
    // As it was as it phased out: its counter's +1/+1 included.
    expect(view.objects[bears]?.power).toBe(3);
  });
});
